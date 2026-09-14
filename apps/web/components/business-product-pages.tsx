import Link from 'next/link';
import { SITE } from '@/lib/content/site';
import styles from './business-product-pages.module.css';

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function PrimaryActions({ secondaryHref, secondaryLabel }: { secondaryHref: string; secondaryLabel: string }) {
  return (
    <div className={styles.actions}>
      <a className={styles.primaryAction} href={SITE.publicAccessUrl}>
        Get Started <Arrow />
      </a>
      <Link className={styles.secondaryAction} href={secondaryHref}>
        {secondaryLabel} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function Label({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return <p className={`${styles.label} ${inverse ? styles.labelInverse : ''}`}>{children}</p>;
}

function FlowDot({ active = false }: { active?: boolean }) {
  return <span className={`${styles.flowDot} ${active ? styles.flowDotActive : ''}`} aria-hidden="true" />;
}

export function VaultRailPage() {
  return (
    <div className={`${styles.page} ${styles.vaultRail}`}>
      <section className={`${styles.hero} ${styles.vaultHero}`}>
        <div className={styles.shell}>
          <div className={styles.heroCopy}>
            <Label inverse>VaultRail</Label>
            <h1>Run financial operations with clarity.</h1>
            <p>
              A business operating environment for treasury context, payments, approvals, policy, counterparties and the record around every decision.
            </p>
            <PrimaryActions secondaryHref="/treasury" secondaryLabel="Explore Treasury" />
          </div>

          <div className={`${styles.productStage} ${styles.vaultStage}`} aria-label="VaultRail operating workspace illustration">
            <div className={styles.workspaceTopbar}>
              <span>VaultRail</span>
              <div><span className={styles.signal} /> Finance operations</div>
            </div>
            <div className={styles.vaultWorkspace}>
              <aside className={styles.workspaceNav} aria-hidden="true">
                <strong>Workspace</strong>
                <span className={styles.navActive}>Overview</span>
                <span>Treasury</span>
                <span>Payments</span>
                <span>Approvals</span>
                <span>Activity</span>
              </aside>
              <div className={styles.workspaceMain}>
                <div className={styles.workspaceHeading}>
                  <div><span>Operating view</span><strong>Financial activity in context</strong></div>
                  <span className={styles.quietBadge}>Policy aware</span>
                </div>
                <div className={styles.workspaceColumns}>
                  <div className={styles.workspacePanel}>
                    <span className={styles.uiKicker}>Treasury context</span>
                    <strong>Operating reserve</strong>
                    <div className={styles.balanceRail}><i /><i /><i /></div>
                    <div className={styles.miniRow}><span>Available</span><em>Ready for reviewed activity</em></div>
                    <div className={styles.miniRow}><span>Reserved</span><em>Committed context</em></div>
                  </div>
                  <div className={styles.workspacePanel}>
                    <span className={styles.uiKicker}>Approvals</span>
                    <strong>Vendor payment</strong>
                    <div className={styles.approvalLine}><span>Initiated</span><FlowDot active /><FlowDot active /><FlowDot /></div>
                    <div className={styles.miniRow}><span>Policy</span><em>Within authority</em></div>
                    <div className={styles.miniRow}><span>Review</span><em>Awaiting approver</em></div>
                  </div>
                </div>
                <div className={styles.activityStrip}>
                  <span className={styles.uiKicker}>Recent operating record</span>
                  <div><b>Counterparty updated</b><span>Ownership and review context retained</span><time>Record</time></div>
                  <div><b>Payment reviewed</b><span>Authority trail attached to intent</span><time>Approval</time></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.whiteSection}`}>
        <div className={`${styles.shell} ${styles.splitLead}`}>
          <div>
            <Label>One operating workspace</Label>
            <h2>Finance work stays connected.</h2>
          </div>
          <p>
            Treasury tells the team where funds sit. Payments captures movement intent. VaultRail keeps those actions beside the authority, policy, counterparty and activity context that explains them.
          </p>
        </div>
        <div className={`${styles.shell} ${styles.operatingBand}`}>
          <div><span>Treasury</span><strong>Location and liquidity context</strong></div>
          <div className={styles.bandConnector} aria-hidden="true" />
          <div><span>Authority</span><strong>Approval and policy context</strong></div>
          <div className={styles.bandConnector} aria-hidden="true" />
          <div><span>Payments</span><strong>Intent and progression</strong></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.cloudSection}`}>
        <div className={`${styles.shell} ${styles.authorityLayout}`}>
          <div className={styles.authorityCopy}>
            <Label>Approvals and authority</Label>
            <h2>Responsibility stays visible.</h2>
            <p>Separate who can initiate, who reviews and what context informed the decision. The interface emphasizes authority before action without pretending that approval equals execution.</p>
          </div>
          <div className={styles.authorityStack} aria-label="Authority relationship illustration">
            <div><span>Initiator</span><strong>Creates financial intent</strong><small>Purpose · counterparty · supporting context</small></div>
            <div className={styles.authorityFocus}><span>Approver</span><strong>Reviews against authority</strong><small>Policy · threshold · supporting evidence</small></div>
            <div><span>Record</span><strong>Preserves the decision trail</strong><small>Decision · actor · time · context</small></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.carbonSection}`}>
        <div className={`${styles.shell} ${styles.controlsLayout}`}>
          <div>
            <Label inverse>Policies and controls</Label>
            <h2>Controls belong inside the work.</h2>
            <p>Surface policy signals where finance teams evaluate activity: before review, beside counterparties and throughout the operating record.</p>
          </div>
          <div className={styles.policyConsole}>
            <div><span>Payment authority</span><b>Review required</b></div>
            <div><span>Destination context</span><b>Known counterparty</b></div>
            <div><span>Supporting record</span><b>Attached to intent</b></div>
            <div><span>Exception path</span><b>Escalate for review</b></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.mineralLightSection}`}>
        <div className={`${styles.shell} ${styles.riskLayout}`}>
          <div className={styles.counterpartyMap} aria-label="Counterparty and risk context illustration">
            <div className={styles.mapCenter}>Finance team</div>
            <div className={`${styles.mapNode} ${styles.mapNodeOne}`}><span>Vendor</span><small>Owner · purpose</small></div>
            <div className={`${styles.mapNode} ${styles.mapNodeTwo}`}><span>Treasury destination</span><small>Control context</small></div>
            <div className={`${styles.mapNode} ${styles.mapNodeThree}`}><span>Exception</span><small>Review path</small></div>
          </div>
          <div>
            <Label>Risk and counterparties</Label>
            <h2>Know what sits around the transaction.</h2>
            <p>Keep the destination, counterparty relationship, policy signal and exception context close to the financial intent being reviewed.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.whiteSection}`}>
        <div className={`${styles.shell} ${styles.recordLayout}`}>
          <div>
            <Label>Audit and continuity</Label>
            <h2>A record teams can follow.</h2>
            <p>VaultRail keeps financial decisions legible over time: what was intended, what was reviewed, what changed and which context travelled with it.</p>
          </div>
          <div className={styles.recordLine}>
            <div><FlowDot active /><span><b>Intent created</b><small>Purpose and counterparty captured</small></span></div>
            <div><FlowDot active /><span><b>Policy reviewed</b><small>Authority context retained</small></span></div>
            <div><FlowDot /><span><b>Downstream state</b><small>Tracked without collapsing lifecycle states</small></span></div>
          </div>
        </div>
      </section>

      <section className={`${styles.closing} ${styles.carbonSection}`}>
        <div className={`${styles.shell} ${styles.closingInner}`}>
          <div><Label inverse>VaultRail</Label><h2>One place to understand the operation before acting on it.</h2></div>
          <PrimaryActions secondaryHref="/payments" secondaryLabel="Explore Payments" />
        </div>
      </section>
    </div>
  );
}

export function TreasuryPage() {
  return (
    <div className={`${styles.page} ${styles.treasury}`}>
      <section className={`${styles.hero} ${styles.treasuryHero}`}>
        <div className={`${styles.shell} ${styles.treasuryHeroGrid}`}>
          <div className={styles.heroCopy}>
            <Label>Treasury</Label>
            <h1>See treasury clearly.</h1>
            <p>Understand where organizational funds sit, what is available for operating needs, and the movement and control context around each destination.</p>
            <PrimaryActions secondaryHref="/vaultrail" secondaryLabel="Explore VaultRail" />
          </div>
          <div className={`${styles.productStage} ${styles.treasuryStage}`} aria-label="Treasury workspace illustration">
            <div className={styles.treasuryHeader}><span>Treasury overview</span><span className={styles.quietBadge}>Organizational view</span></div>
            <div className={styles.treasuryBody}>
              <aside className={styles.accountTree}>
                <span className={styles.uiKicker}>Structure</span>
                <div className={styles.accountRoot}><i />Operating treasury</div>
                <div className={styles.accountChild}><i />Primary reserve</div>
                <div className={styles.accountChild}><i />Vendor operations</div>
                <div className={styles.accountChild}><i />Tax reserve</div>
              </aside>
              <div className={styles.liquidityPanel}>
                <span className={styles.uiKicker}>Liquidity context</span>
                <h3>Primary reserve</h3>
                <div className={styles.liquidityBars}><i /><i /><i /></div>
                <div className={styles.liquidityLegend}><span>Available</span><span>Reserved</span><span>Pending context</span></div>
                <div className={styles.movementRows}>
                  <div><span>Vendor operations</span><b>Internal movement context</b><em>Reviewed</em></div>
                  <div><span>Approved destination</span><b>External destination record</b><em>Known</em></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.mineralLightSection}`}>
        <div className={`${styles.shell} ${styles.treasuryOverview}`}>
          <div><Label>Treasury overview</Label><h2>Location before movement.</h2></div>
          <div className={styles.locationLines}>
            <div><span>Operating funds</span><b>Primary reserve</b><small>Working liquidity context</small></div>
            <div><span>Committed funds</span><b>Reserved context</b><small>Obligations remain visible</small></div>
            <div><span>Destinations</span><b>Known endpoints</b><small>Authority travels with movement</small></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.carbonSection}`}>
        <div className={`${styles.shell} ${styles.structureLayout}`}>
          <div>
            <Label inverse>Accounts and structure</Label>
            <h2>Organize money by operating purpose.</h2>
            <p>A treasury view should explain the relationship between reserves, working funds and destinations without turning the page into a portfolio or performance screen.</p>
          </div>
          <div className={styles.structureDiagram} aria-label="Treasury account hierarchy illustration">
            <div className={styles.structureRoot}>Organization treasury</div>
            <div className={styles.structureChildren}>
              <div><span>Reserve</span><small>Liquidity context</small></div>
              <div><span>Operations</span><small>Working funds</small></div>
              <div><span>Destinations</span><small>Authorized context</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.whiteSection}`}>
        <div className={`${styles.shell} ${styles.movementLayout}`}>
          <div className={styles.movementLedger}>
            <div className={styles.ledgerHead}><span>Movement history</span><span>Context</span><span>State</span></div>
            <div><span>Reserve → Operations</span><small>Working liquidity</small><b>Recorded</b></div>
            <div><span>Operations → Destination</span><small>Vendor purpose</small><b>Under review</b></div>
            <div><span>Destination update</span><small>Authority change</small><b>Recorded</b></div>
          </div>
          <div><Label>Movement visibility</Label><h2>Follow why money is moving.</h2><p>Movement history should carry purpose and destination context, not just direction. Review lifecycle states separately so intent, authorization and downstream completion are never blurred together.</p></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.cloudSection}`}>
        <div className={`${styles.shell} ${styles.destinationLayout}`}>
          <div><Label>Authorized destinations</Label><h2>Destination context stays close.</h2><p>Keep ownership, purpose, review status and changes visible around the endpoint a finance team intends to use.</p></div>
          <div className={styles.destinationCard}>
            <div><span className={styles.uiKicker}>Destination record</span><strong>Vendor operating destination</strong></div>
            <dl><div><dt>Purpose</dt><dd>Operating expense</dd></div><div><dt>Authority</dt><dd>Reviewed destination</dd></div><div><dt>Change record</dt><dd>History retained</dd></div></dl>
          </div>
        </div>
      </section>

      <section className={`${styles.closing} ${styles.carbonSection}`}>
        <div className={`${styles.shell} ${styles.closingInner}`}>
          <div><Label inverse>Treasury</Label><h2>Know where the money is — and the context that governs it.</h2></div>
          <PrimaryActions secondaryHref="/payments" secondaryLabel="See Payments" />
        </div>
      </section>
    </div>
  );
}

export function PaymentsPage() {
  return (
    <div className={`${styles.page} ${styles.payments}`}>
      <section className={`${styles.hero} ${styles.paymentsHero}`}>
        <div className={`${styles.shell} ${styles.paymentsHeroGrid}`}>
          <div className={styles.heroCopy}>
            <Label inverse>Payments</Label>
            <h1>Move money with context.</h1>
            <p>Shape payment intent around the recipient, purpose, policy and authority that should remain visible from creation through the operating record.</p>
            <PrimaryActions secondaryHref="/vaultrail" secondaryLabel="Explore VaultRail" />
          </div>
          <div className={`${styles.productStage} ${styles.paymentStage}`} aria-label="Governed payment flow illustration">
            <div className={styles.paymentFormHead}><span>New payment</span><span className={styles.quietBadge}>Draft intent</span></div>
            <div className={styles.paymentForm}>
              <label><span>Recipient</span><strong>Northstar Services</strong><small>Known counterparty · operating vendor</small></label>
              <div className={styles.paymentPair}><label><span>Amount</span><strong>Amount entered at creation</strong></label><label><span>Purpose</span><strong>Operating expense</strong></label></div>
              <div className={styles.preflight}><span>Policy preflight</span><b><i /> Approval required</b><small>Authority is checked before downstream submission.</small></div>
              <div className={styles.paymentStatusLine}><span>Intent</span><FlowDot active /><span>Review</span><FlowDot /><span>Authorization</span><FlowDot /><span>Submission</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.whiteSection}`}>
        <div className={`${styles.shell} ${styles.intentLayout}`}>
          <div><Label>Create a payment</Label><h2>Start with intent, not a transaction ID.</h2><p>Capture the recipient, purpose and business context before the workflow asks anyone to authorize movement.</p></div>
          <div className={styles.intentSheet}>
            <div><span>Recipient</span><strong>Known business counterparty</strong></div>
            <div><span>Purpose</span><strong>Operating expense</strong></div>
            <div><span>Supporting context</span><strong>Invoice and internal note</strong></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.cloudSection}`}>
        <div className={`${styles.shell} ${styles.counterpartyLayout}`}>
          <div className={styles.counterpartyProfile}>
            <div className={styles.counterpartyAvatar}>NS</div><div><span className={styles.uiKicker}>Counterparty</span><strong>Northstar Services</strong><small>Vendor relationship</small></div>
            <dl><div><dt>Purpose</dt><dd>Operating services</dd></div><div><dt>Destination</dt><dd>Reviewed record</dd></div><div><dt>Change context</dt><dd>Visible before approval</dd></div></dl>
          </div>
          <div><Label>Counterparty context</Label><h2>Know who sits on the other side.</h2><p>Payment review is stronger when the recipient relationship, destination context and recent changes are visible beside the request.</p></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.mineralSection}`}>
        <div className={`${styles.shell} ${styles.preflightLayout}`}>
          <div><Label inverse>Policy preflight</Label><h2>Surface the rule before the approval.</h2><p>Policy can shape the review without pretending to make the decision. Keep thresholds, destination context and exception signals legible before authorization.</p></div>
          <div className={styles.preflightBoard}>
            <div><span>Authority</span><b>Approver required</b></div>
            <div><span>Counterparty</span><b>Known relationship</b></div>
            <div><span>Exception</span><b>No exception raised</b></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.whiteSection}`}>
        <div className={`${styles.shell} ${styles.approvalLayout}`}>
          <div className={styles.approvalCard}>
            <span className={styles.uiKicker}>Approval request</span><h3>Operating payment</h3>
            <div><span>Initiator</span><b>Finance operator</b></div><div><span>Approver</span><b>Authorized reviewer</b></div><div><span>Decision context</span><b>Policy + recipient + purpose</b></div>
            <p>Approval records the decision. It does not imply submission or settlement.</p>
          </div>
          <div><Label>Approvals</Label><h2>Decision and movement stay distinct.</h2><p>Make authority explicit, preserve separation of duties and keep the approval record attached to the intent that was actually reviewed.</p></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.carbonSection}`}>
        <div className={`${styles.shell} ${styles.progressLayout}`}>
          <div><Label inverse>Status and progression</Label><h2>One lifecycle. Distinct states.</h2><p>Track authorization, submission, confirmation and reconciliation as separate operating concepts. The interface should show progression without promising speed or collapsing evidence.</p></div>
          <div className={styles.progressTrack}>
            <div className={styles.progressActive}><FlowDot active /><span><b>Intent</b><small>Payment context captured</small></span></div>
            <div className={styles.progressActive}><FlowDot active /><span><b>Authorized</b><small>Decision recorded</small></span></div>
            <div><FlowDot /><span><b>Submitted</b><small>Downstream movement state</small></span></div>
            <div><FlowDot /><span><b>Confirmed</b><small>Provider or network evidence</small></span></div>
            <div><FlowDot /><span><b>Reconciled</b><small>Record matched to authority</small></span></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.mineralLightSection}`}>
        <div className={`${styles.shell} ${styles.evidenceLayout}`}>
          <div className={styles.evidenceSheet}>
            <span className={styles.uiKicker}>Payment record</span>
            <div><span>Intent</span><b>Recipient + purpose retained</b></div><div><span>Policy</span><b>Preflight context retained</b></div><div><span>Approval</span><b>Decision actor retained</b></div><div><span>Progression</span><b>Lifecycle evidence separated</b></div>
          </div>
          <div><Label>Evidence and exceptions</Label><h2>Keep the trail useful after the click.</h2><p>Preserve what changed, who reviewed it and which evidence belongs to each lifecycle state. Exceptions should return to review instead of disappearing into a generic “complete” state.</p></div>
        </div>
      </section>

      <section className={`${styles.closing} ${styles.carbonSection}`}>
        <div className={`${styles.shell} ${styles.closingInner}`}>
          <div><Label inverse>Payments</Label><h2>Every payment should carry its authority with it.</h2></div>
          <PrimaryActions secondaryHref="/treasury" secondaryLabel="See Treasury" />
        </div>
      </section>
    </div>
  );
}
