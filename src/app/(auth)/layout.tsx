export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(222 47% 11%)' }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-80 shrink-0 p-10"
        style={{ borderRight: '1px solid hsl(222 30% 18%)' }}>
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-base">
              D
            </div>
            <div>
              <p className="font-semibold text-white text-sm leading-none">DTSP</p>
              <p className="text-[11px] mt-0.5 leading-none" style={{ color: 'hsl(218 20% 55%)' }}>
                Coach Platform
              </p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white leading-snug">
            District Teacher<br />Support Programme
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'hsl(218 20% 55%)' }}>
            Coaching CRM for field coordinators managing UP primary school teachers.
          </p>
        </div>
        <p className="text-[11px]" style={{ color: 'hsl(218 20% 38%)' }}>
          Central Square Foundation · Alpha
        </p>
      </div>

      {/* Right login area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
