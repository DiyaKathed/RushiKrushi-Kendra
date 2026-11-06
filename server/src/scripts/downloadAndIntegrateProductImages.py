import os
import re
import json
import ssl
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
import io

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
AUDIT_FILE = os.path.join(PROJECT_ROOT, 'server/src/data/all98ProductsAudit.json')
IFFCO_API_FILE = os.path.join(PROJECT_ROOT, 'server/src/data/iffcomc_official_api_p1.json')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'client/public/images/products')
MANIFEST_SERVER = os.path.join(PROJECT_ROOT, 'server/src/data/productImageManifest.json')
MANIFEST_CLIENT = os.path.join(OUTPUT_DIR, 'manifest.json')

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(AUDIT_FILE, 'r', encoding='utf-8') as f:
    audit_products = json.load(f)

with open(IFFCO_API_FILE, 'r', encoding='utf-8') as f:
    official_iffco = json.load(f)

def norm_name(s):
    return re.sub(r'[^A-Z0-9]', '', s.upper().replace('IFFCO-MC', ''))

# Build official IFFCO map
official_iffco_map = {}
for p in official_iffco:
    t = p['title']['rendered'].strip()
    media = p.get('_embedded', {}).get('wp:featuredmedia', [{}])[0]
    media_url = media.get('source_url')
    alt_text = media.get('alt_text', '')
    k = norm_name(t)
    official_iffco_map[k] = {
        'title': t,
        'url': media_url,
        'alt_text': alt_text or f'{t} packaging',
        'source': 'Official IFFCO-MC Crop Science Ltd Portal (iffcomc.in)',
        'attribution': 'IFFCO-MC Crop Science Private Limited'
    }

manual_iffco_aliases = {
    'AZANEXA': 'AZANEXA3K',
    'HIBIKI': 'HIBKI',
    'SHIGOTO': 'SHIGOTO408'
}

# Zytonic source map
zytonic_sources = {
    'zytonic-m': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-M_img11_Im29.jp2.png'),
        'source': 'Zydex Group Official Zytonic-M Technical Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-active': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-Active_p1_img4_Im47.jp2.png'),
        'source': 'Zydex Group Official Zytonic Active Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-godhan': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-Godhan_img2_Im16.jp2.png'),
        'source': 'Zydex Group Official Zytonic Godhan Technical Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-k': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-K_img1_Im13.jp2.png'),
        'source': 'Zydex Group Official Zytonic-K Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-npk': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-NPK_img5_Im19.jp2.png'),
        'source': 'Zydex Group Official Zytonic NPK Biofertilizer Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-zinc': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-Zinc_img3_Im65.jp2.png'),
        'source': 'Zydex Group Official Zytonic Zinc Biofertilizer Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-mini-kit': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-Mini-Kit_img1_Im13.jp2.png'),
        'source': 'Zydex Group Official Zytonic Mini Kit Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-nursery-kit': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-Nursery-Kit_img5_Im19.jp2.png'),
        'source': 'Zydex Group Official Zytonic Nursery Kit Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-neem': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-Neem_img1_Im23.jp2.png'),
        'source': 'Zydex Group Official Zytonic Neem Natural Crop Protector Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    },
    'zytonic-suraksha': {
        'file': os.path.join(PROJECT_ROOT, 'server/src/data/zydex_extracted/Zytonic-Suraksha_img1_Im15.jp2.png'),
        'source': 'Zydex Group Official Zytonic Suraksha Foliar Biofertilizer Brochure',
        'attribution': 'Zydex Industries (Agriculture Division)'
    }
}

aspee_source = {
    'file': os.path.join(PROJECT_ROOT, 'server/src/data/aspee_sprayer.png'),
    'source': 'ASPEE Official Website Catalogue (aspee.com)',
    'attribution': 'Aspee Agricultural Equipment Pvt. Ltd.'
}

def optimize_and_save_image(im, out_path, max_dim=800, quality=85):
    if max(im.size) > max_dim:
        ratio = max_dim / max(im.size)
        new_size = (max(1, int(im.size[0] * ratio)), max(1, int(im.size[1] * ratio)))
        im = im.resize(new_size, Image.Resampling.LANCZOS)
    im.save(out_path, format='WEBP', quality=quality)
    return os.path.getsize(out_path), im.size

manifest = []

# Process Zytonic and Legacy products first
for p in audit_products:
    brand = p['brand']
    name_en = p['nameEn']
    name_mr = p['nameMr'] or name_en
    slug = p['slug']
    pid = p['id']

    if brand == 'IFFCO-MC':
        continue # handled in concurrent batch

    entry = {
        'id': pid,
        'slug': slug,
        'nameEn': name_en,
        'nameMr': name_mr,
        'brand': brand,
        'category': p['category'],
        'packSizes': p['packSizes'],
        'status': 'pending',
        'verified': False,
        'imageUrl': '',
        'source': '',
        'attribution': '',
        'notes': ''
    }

    if brand == 'Aspee Agricultural Equipment':
        out_name = 'aspee-battery-operated-knapsack-sprayer-16l.webp'
        out_path = os.path.join(OUTPUT_DIR, out_name)
        try:
            im = Image.open(aspee_source['file'])
            sz, dims = optimize_and_save_image(im, out_path)
            entry['status'] = 'verified'
            entry['verified'] = True
            entry['imageUrl'] = f'/images/products/{out_name}'
            entry['source'] = aspee_source['source']
            entry['attribution'] = aspee_source['attribution']
            entry['dimensions'] = dims
            entry['fileSizeBytes'] = sz
            entry['notes'] = 'Official manufacturer product photograph from Aspee India catalogue'
            print(f'[VERIFIED] {name_en} -> {out_name} ({sz} bytes, {dims})')
        except Exception as e:
            entry['notes'] = f'Failed processing Aspee image: {e}'
            print(f'[ERROR] Aspee: {e}')

    elif brand == 'Zytonic':
        name_upper = name_en.upper()
        matched_key = None
        if 'BIOACTIVE' in name_upper:
            matched_key = None  # Distinct product from Zytonic Active, keep pending
        elif re.search(r'\bACTIVE\b', name_upper):
            matched_key = 'zytonic-active'
        elif 'GODHAN' in name_upper:
            matched_key = 'zytonic-godhan'
        elif 'MINI KIT' in name_upper:
            matched_key = 'zytonic-mini-kit'
        elif 'NURSERY KIT' in name_upper:
            matched_key = 'zytonic-nursery-kit'
        elif 'NEEM' in name_upper:
            matched_key = 'zytonic-neem'
        elif 'SURAKSHA' in name_upper:
            matched_key = 'zytonic-suraksha'
        elif 'NPK' in name_upper:
            matched_key = 'zytonic-npk'
        elif 'ZINC' in name_upper:
            matched_key = 'zytonic-zinc'
        elif 'ZYTONIC K' in name_upper or 'ZYTONIC-K' in name_upper:
            matched_key = 'zytonic-k'
        elif 'ZYTONIC-M' in name_upper or 'ZYTONIC M' in name_upper:
            matched_key = 'zytonic-m'

        if matched_key and matched_key in zytonic_sources:
            src_info = zytonic_sources[matched_key]
            out_name = f'{matched_key}.webp'
            out_path = os.path.join(OUTPUT_DIR, out_name)
            try:
                if not os.path.exists(out_path):
                    im = Image.open(src_info['file'])
                    sz, dims = optimize_and_save_image(im, out_path)
                else:
                    sz = os.path.getsize(out_path)
                    im = Image.open(out_path)
                    dims = im.size
                entry['status'] = 'verified'
                entry['verified'] = True
                entry['imageUrl'] = f'/images/products/{out_name}'
                entry['source'] = src_info['source']
                entry['attribution'] = src_info['attribution']
                entry['dimensions'] = dims
                entry['fileSizeBytes'] = sz
                entry['notes'] = f'Authentic packaging pack shot extracted from official {src_info["attribution"]} brochure'
                print(f'[VERIFIED] {name_en} -> {out_name} ({sz} bytes, {dims})')
            except Exception as e:
                entry['notes'] = f'Failed processing Zytonic image: {e}'
                print(f'[ERROR] Zytonic {name_en}: {e}')
        else:
            entry['status'] = 'pending'
            entry['verified'] = False
            entry['imageUrl'] = '' # clean placeholder fallback
            entry['notes'] = 'Pending manufacturer brochure release for exact packaging variant. Clean agricultural fallback displayed.'
            print(f'[PENDING] {name_en}')

    else:
        # Legacy products: ADAMA Custodia, FMC Coragen, IFFCO 10:26:26, Mahyco, Multiplex Kranti
        entry['status'] = 'pending'
        entry['verified'] = False
        entry['imageUrl'] = '' # remove generic Unsplash stock photo
        entry['notes'] = 'Replaced generic Unsplash stock photo with clean agricultural placeholder. Official manufacturer pack shot pending authorization.'
        print(f'[LEGACY PENDING] {name_en} ({brand})')

    manifest.append(entry)

# Now process IFFCO-MC products concurrently
iffco_products = [p for p in audit_products if p['brand'] == 'IFFCO-MC']
print(f'\nStarting concurrent download of {len(iffco_products)} IFFCO-MC products...')

def fetch_and_save_iffco(p):
    name_en = p['nameEn']
    name_mr = p['nameMr'] or name_en
    slug = p['slug']
    pid = p['id']

    k = norm_name(name_en)
    if k in manual_iffco_aliases:
        k = manual_iffco_aliases[k]

    hit = official_iffco_map.get(k)
    clean_slug = re.sub(r'[^a-z0-9]+', '-', name_en.lower()).strip('-')
    out_name = f'{clean_slug}.webp'
    out_path = os.path.join(OUTPUT_DIR, out_name)

    entry = {
        'id': pid,
        'slug': slug,
        'nameEn': name_en,
        'nameMr': name_mr,
        'brand': 'IFFCO-MC',
        'category': p['category'],
        'packSizes': p['packSizes'],
        'status': 'pending',
        'verified': False,
        'imageUrl': '',
        'source': '',
        'attribution': '',
        'notes': ''
    }

    if not hit or not hit.get('url'):
        entry['notes'] = 'No official URL found in IFFCO-MC CMS'
        return entry

    media_url = hit['url']
    req = urllib.request.Request(media_url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
    
    # Retry loop
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
                raw_bytes = resp.read()
            im = Image.open(io.BytesIO(raw_bytes))
            sz, dims = optimize_and_save_image(im, out_path, max_dim=800, quality=85)
            entry['status'] = 'verified'
            entry['verified'] = True
            entry['imageUrl'] = f'/images/products/{out_name}'
            entry['source'] = hit['source']
            entry['attribution'] = hit['attribution']
            entry['remoteUrl'] = media_url
            entry['dimensions'] = dims
            entry['fileSizeBytes'] = sz
            entry['notes'] = f'Official pack shot from IFFCO-MC CMS: {hit["title"]}'
            print(f'[IFFCO-MC OK] {name_en} -> {out_name} ({sz} bytes, {dims})')
            break
        except Exception as e:
            if attempt == max_retries - 1:
                entry['notes'] = f'Download failed after {max_retries} attempts: {e}'
                print(f'[IFFCO-MC FAIL] {name_en}: {e}')
            time.sleep(1)

    return entry

with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(fetch_and_save_iffco, p): p for p in iffco_products}
    for future in as_completed(futures):
        res = future.result()
        manifest.append(res)

# Sort manifest deterministically by brand, then nameEn
manifest.sort(key=lambda x: (x['brand'], x['nameEn']))

# Save manifests
with open(MANIFEST_SERVER, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

with open(MANIFEST_CLIENT, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

total_audited = len(manifest)
verified_count = sum(1 for m in manifest if m['verified'])
pending_count = sum(1 for m in manifest if not m['verified'])
print('\n=======================================')
print('IMAGE INTEGRATION SUMMARY:')
print(f'Total products audited: {total_audited}')
print(f'Verified images added: {verified_count}')
print(f'Pending products: {pending_count}')
print(f'Manifest saved to {MANIFEST_SERVER}')
print(f'Client manifest saved to {MANIFEST_CLIENT}')
print('=======================================')
