import { requireProvisionedUser } from '@/lib/auth';
import {
  AccountStateGrid,
  ActivityPanel,
  BalancePanel,
  CapitalAccountHeader,
  CapitalActionState,
  CapitalContextPanel,
  CapitalPositionCard,
  DestinationPanel,
  MovementPanel,
  type AccountStateItem,
  type CapitalActionItem,
  type CapitalContextItem,
} from '@/components/product/CapitalAccountExperience';
import styles from './CapitalAccount.module.css';

const accountStates: readonly AccountStateItem[] = [
  {
    label: 'Balance state',
    title: 'Balances unavailable',
    description: 'Account balances will appear here when connected.',
    state: 'UNAVAILABLE',
  },
  {
    label: 'Movement readiness',
    title: 'Movement capability unavailable',
    description: 'Deposit and withdrawal capabilities will appear here when enabled.',
    state: 'UNAVAILABLE',
  },
  {
    label: 'Account configuration',
    title: 'Account configuration incomplete',
    description: 'Required account settings will appear here.',
    state: 'NOT_CONFIGURED',
  },
  {
    label: 'Data status',
    title: 'Awaiting information',
    description: 'Awaiting connected account information.',
    state: 'PENDING',
  },
];

const capitalActions: readonly CapitalActionItem[] = [
  {
    label: 'Deposit',
    description: 'Funding capability has not been enabled for this account.',
    state: 'UNAVAILABLE',
  },
  {
    label: 'Withdraw',
    description: 'Withdrawal capability has not been enabled for this account.',
    state: 'UNAVAILABLE',
  },
  {
    label: 'Transfer',
    description: 'Transfer capability has not been enabled for this account.',
    state: 'UNAVAILABLE',
  },
];

const capitalContext: readonly CapitalContextItem[] = [
  { label: 'Account state', value: 'Awaiting connection', state: 'PENDING' },
  { label: 'Movement state', value: 'Unavailable', state: 'UNAVAILABLE' },
  { label: 'Information state', value: 'Developing', state: 'PENDING' },
];

export default async function CapitalAccountPage() {
  await requireProvisionedUser();

  return (
    <div className="space-y-10 lg:space-y-12">
      <CapitalAccountHeader />
      <div className={styles.reveal}>
        <CapitalPositionCard />
      </div>
      <div className={`${styles.reveal} ${styles.delayOne}`}>
        <AccountStateGrid items={accountStates} />
      </div>
      <CapitalActionState items={capitalActions} />
      <BalancePanel />
      <div className={`${styles.reveal} ${styles.delayTwo}`}>
        <MovementPanel items={capitalActions} />
      </div>
      <DestinationPanel />
      <ActivityPanel />
      <CapitalContextPanel items={capitalContext} />
    </div>
  );
}
