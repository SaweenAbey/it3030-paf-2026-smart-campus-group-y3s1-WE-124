const Bookings = () => {
  return (
    <main className="min-h-[calc(100vh-6rem)] bg-slate-50 px-4 pt-24 pb-8 sm:px-6">
      <section className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-500">
            Booking Center
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="mt-2 text-slate-500">
            Manage room, facility, and service bookings from one place.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Classroom Reservation', status: 'Open', slot: '8 available today' },
              { title: 'Lab Equipment Booking', status: 'Open', slot: '5 available today' },
              { title: 'Meeting Room Booking', status: 'Busy', slot: '2 available today' },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-base font-semibold text-slate-800">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">Status: {item.status}</p>
                <p className="mt-1 text-sm text-slate-500">{item.slot}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Bookings;
