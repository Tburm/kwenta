import { useRouter } from 'next/router';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button/Button';
import { FlexDivRowCentered } from 'components/layout/flex';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { truncateNumbers } from 'sdk/utils/number';
import { SplitStakingCard } from 'sections/dashboard/Stake/card';
import { Heading } from 'sections/earn/text';
import { useAppSelector } from 'state/hooks';
import {
	selectClaimableBalance,
	selectEscrowedKwentaBalance,
	selectKwentaBalance,
	selectStakedEscrowedKwentaBalance,
	selectStakedKwentaBalance,
	selectTotalVestable,
} from 'state/staking/selectors';
import media from 'styles/media';

export enum StakeTab {
	Staking = 'staking',
	Escrow = 'escrow',
	TradingRewards = 'trading-rewards',
	Redemption = 'redemption',
}

type StakingPortfolioProps = {
	setCurrentTab(tab: StakeTab): void;
};

const StakingPortfolio: FC<StakingPortfolioProps> = ({ setCurrentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const kwentaBalance = useAppSelector(selectKwentaBalance);
	const escrowedKwentaBalance = useAppSelector(selectEscrowedKwentaBalance);
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance);
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance);
	const claimableBalance = useAppSelector(selectClaimableBalance);
	const totalVestable = useAppSelector(selectTotalVestable);

	const DEFAULT_CARDS = [
		[
			{
				key: 'Liquid',
				title: t('dashboard.stake.portfolio.liquid'),
				value: truncateNumbers(kwentaBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Staking),
			},
			{
				key: 'Escrow',
				title: t('dashboard.stake.portfolio.escrow'),
				value: truncateNumbers(escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance), 2),
				onClick: () => setCurrentTab(StakeTab.Escrow),
			},
		],
		[
			{
				key: 'Staked',
				title: t('dashboard.stake.portfolio.staked'),
				value: truncateNumbers(stakedKwentaBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Staking),
			},
			{
				key: 'StakedEscrow',
				title: t('dashboard.stake.portfolio.staked-escrow'),
				value: truncateNumbers(stakedEscrowedKwentaBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Escrow),
			},
		],
		[
			{
				key: 'Claimable',
				title: t('dashboard.stake.portfolio.claimable'),
				value: truncateNumbers(claimableBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Staking),
			},
			{
				key: 'Vestable',
				title: t('dashboard.stake.portfolio.vestable'),
				value: truncateNumbers(totalVestable, 2),
				onClick: () => setCurrentTab(StakeTab.Escrow),
			},
		],
	];

	return (
		<StakingPortfolioContainer>
			<StakingHeading>
				<Heading>{t('dashboard.stake.portfolio.title')}</Heading>
				<ButtonContainer>
					<Button size="small" onClick={() => router.push(ROUTES.Dashboard.Earn)}>
						Earn Page
					</Button>
					<Button size="small" onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}>
						Staking Docs
					</Button>
				</ButtonContainer>
			</StakingHeading>
			<CardsContainer>
				{DEFAULT_CARDS.map((card, i) => (
					<SplitStakingCard key={i}>
						{card.map(({ key, title, value, onClick }) => (
							<div key={key} onClick={onClick}>
								<div className="title">{title}</div>
								<div className="value">{value}</div>
							</div>
						))}
					</SplitStakingCard>
				))}
			</CardsContainer>
		</StakingPortfolioContainer>
	);
};

const ButtonContainer = styled(FlexDivRowCentered)`
	column-gap: 10px;
`;

const StakingHeading = styled(FlexDivRowCentered)`
	margin-bottom: 15px;
`;

const StakingPortfolioContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-top: 20px;
		margin-bottom: 100px;
	`}
`;

const CardsContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(334px, 1fr));
	grid-gap: 15px;
`;

export default StakingPortfolio;
