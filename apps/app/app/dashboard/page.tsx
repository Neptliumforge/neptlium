import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck, Clock3 } from 'lucide-react';
import { requireProvisionedUser } from '@/lib/auth';

const portfolio = [
  ['Public markets','36%',36],
  ['Private companies','28%',28],
  ['Cash & liquidity','18%',18],
  ['Real assets','12%',12],
  ['Other','6%',6],
] as const;

const activity = [
  ['Portfolio','Company position updated','12:41'],
  ['Treasury','Movement reviewed','10:18'],
  ['Capital Account','Funding observed','09:52'],
] as const;

export default async function DashboardPage() {
  const { profile } = await requireProvisionedUser();
  const firstName = (profile.fullName ?? profile.displayName ?? 'there').split(' ')[0];

  return (
    <div className="app-overview">
      <section className="overview-intro">
        <div>
          <p className="overview-kicker">Capital environment</p>
          <h1>Good morning, {firstName}.</h1>
          <p>Here’s the current view of your capital environment.</p>
        </div>
        <span className="preview-state">Preview interface · not live financial data</span>
      </section>

      <section className="capital-hero" aria-labelledby="capital-summary-title">
        <div className="capital-hero-main">
          <p id="capital-summary-title">Total capital</p>
          <strong>—</strong>
          <span>Connect capital sources to populate this view.</span>
        </div>
        <div className="capital-metrics">
          {[['Available liquidity','—'],['Committed','—'],['Modeled','—']].map(([label,value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      </section>

      <section className="overview-grid">
        <article className="overview-panel portfolio-panel">
          <div className="panel-heading"><div><span>Portfolio</span><h2>Composition</h2></div><Link href="/dashboard/portfolio">View portfolio <ArrowRight size={15} /></Link></div>
          <div className="portfolio-bars">
            {portfolio.map(([label,value,width]) => <div className="portfolio-row" key={label}><div><span>{label}</span><b>{value}</b></div><i style={{'--bar': `${width}%`} as CSSProperties} /></div>)}
          </div>
          <p className="panel-note">Illustrative composition for interface architecture only.</p>
        </article>

        <article className="overview-panel liquidity-panel">
          <div className="panel-heading"><div><span>Treasury</span><h2>Liquidity</h2></div><Link href="/dashboard/treasury">Open treasury <ArrowRight size={15} /></Link></div>
          <div className="liquidity-curve" aria-hidden="true"><span/><span/><span/><i/></div>
          <div className="liquidity-stats"><div><span>Available</span><strong>—</strong></div><div><span>Reserved</span><strong>—</strong></div><div><span>30-day needs</span><strong>—</strong></div></div>
        </article>
      </section>

      <section className="overview-grid lower-grid">
        <article className="overview-panel attention-panel">
          <div className="panel-heading"><div><span>Attention</span><h2>Needs attention</h2></div></div>
          <div className="attention-clear"><CircleCheck size={22}/><div><strong>You’re up to date.</strong><p>No capital work currently needs your attention.</p></div></div>
          <Link className="text-action" href="/dashboard/allocations">Review allocation workspace <ArrowRight size={15}/></Link>
        </article>

        <article className="overview-panel activity-panel">
          <div className="panel-heading"><div><span>Recent</span><h2>Activity</h2></div><Link href="/dashboard/transactions">View all <ArrowRight size={15}/></Link></div>
          <div className="activity-list">
            {activity.map(([area,event,time]) => <div className="activity-row" key={event}><div><span>{area}</span><strong>{event}</strong></div><time><Clock3 size={13}/>{time}</time></div>)}
          </div>
          <p className="panel-note">Example activity is shown to establish the production layout.</p>
        </article>
      </section>
    </div>
  );
}
