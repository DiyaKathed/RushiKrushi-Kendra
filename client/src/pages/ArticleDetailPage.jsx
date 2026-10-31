import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowLeft, Calendar, FileText, Share2, Tag } from 'lucide-react';
import { getArticle, extractItem, extractArticles } from '../services/api';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await getArticle(slug);
        const item = extractItem(res, 'article');
        if (item) {
          setArticle(item);
          setRelatedArticles(extractArticles(res.data?.related || []));
        }
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-agro-200 border-t-agro-forest rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-stone-800">Article not found</h2>
        <Link to="/farming-guide" className="text-sm font-semibold text-agro-forest underline">
          Back to Farming Guide
        </Link>
      </div>
    );
  }

  const title = currentLang === 'mr' ? article.titleMr || article.titleEn : article.titleEn;
  const content = currentLang === 'mr' ? article.contentMr || article.contentEn : article.contentEn;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/farming-guide"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5D685B] hover:text-[#245C2A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} to Farming Guide</span>
        </Link>
      </div>

      <article className="bg-white rounded-xl border border-[#D7E1D1] p-6 sm:p-10 shadow-card space-y-6">
        <div className="space-y-3 border-b border-[#D7E1D1] pb-6">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#245C2A] uppercase tracking-wider bg-[#EAF2E3] px-2.5 py-1 rounded border border-[#D7E1D1]">
            <Tag className="w-3.5 h-3.5" />
            <span>{article.category}</span>
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#245C2A] font-marathi leading-tight">
            {title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-[#5D685B] pt-1">
            <span>{article.sourceReferences || 'ICAR / MPKV Agronomy'}</span>
            <span>•</span>
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {article.imageUrl && (
          <div className="rounded-xl overflow-hidden aspect-16/9 bg-[#FAF8F0] border border-[#D7E1D1]">
            <img
              src={article.imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-agro.svg';
              }}
            />
          </div>
        )}

        {/* Article Body */}
        <div className="max-w-none text-[#263328] leading-relaxed space-y-4 text-sm sm:text-base font-sans">
          {content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl font-bold text-[#245C2A] font-marathi pt-4 pb-1 border-b border-[#D7E1D1]">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('#### ')) {
              return (
                <h4 key={idx} className="text-lg font-bold text-[#263328] font-marathi pt-2">
                  {paragraph.replace('#### ', '')}
                </h4>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-bold text-[#245C2A] font-marathi">
            {currentLang === 'mr' ? 'इतर संबंधित लेख' : 'Related Articles'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel._id}
                to={`/farming-guide/articles/${rel.slug || rel._id}`}
                className="p-4 rounded-xl bg-white border border-[#D7E1D1] hover:border-[#245C2A] hover:shadow-card transition block"
              >
                <h3 className="text-sm font-bold text-[#263328] font-marathi line-clamp-2">
                  {currentLang === 'mr' ? rel.titleMr || rel.titleEn : rel.titleEn}
                </h3>
                <span className="text-xs text-[#245C2A] font-semibold mt-2 inline-block">
                  {t('common.readMore')} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailPage;
