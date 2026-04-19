import { Link, useLocation } from 'react-router-dom';

const renderStars = (rating) => '★'.repeat(Math.max(1, Math.min(5, rating || 5)));

const ReviewSubmittedPage = () => {
  const location = useLocation();
  const review = location.state?.review;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,#dbeafe,transparent_35%),#f8fafc] px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_30px_90px_-60px_rgba(2,132,199,0.5)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Review Submitted</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Thank You for Your Feedback</h1>
          <p className="mt-3 text-sm text-slate-600">
            Your review has been stored in the database and is now available for display on the Home page review section.
          </p>

          {review ? (
            <article className="mt-7 rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-5">
              <p className="text-sm font-semibold text-amber-600">{renderStars(review.rating)} ({review.rating}/5)</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{review.title}</h2>
              {review.supportTopic ? (
                <p className="mt-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  {review.supportTopic}
                </p>
              ) : null}
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{review.comment}</p>
            </article>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Home
            </Link>
            <Link
              to="/support/review"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Add Another Review
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReviewSubmittedPage;
