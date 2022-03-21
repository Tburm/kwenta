import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { wei } from '@synthetixio/wei';

import { FlexDiv, FlexDivCol } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import Button from 'components/Button';
import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import ClosePositionModal from './ClosePositionModal';
import { useRouter } from 'next/router';
import Connector from 'containers/Connector';
import { NO_VALUE } from 'constants/placeholder';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';

type PositionCardProps = {
	currencyKey: string;
	position: FuturesPosition | null;
	currencyKeyRate: number;
	onPositionClose?: () => void;
	dashboard?: boolean;
};

const PositionCard: React.FC<PositionCardProps> = ({
	currencyKey,
	position,
	currencyKeyRate,
	onPositionClose,
	dashboard,
}) => {
	const { t } = useTranslation();
	const positionDetails = position?.position ?? null;
	const [closePositionModalIsVisible, setClosePositionModalIsVisible] = useState<boolean>(false);
	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const futuresMarketsQuery = useGetFuturesMarkets();

	const futuresPositions = futuresPositionsQuery?.data ?? null;
	const futuresMarkets = futuresMarketsQuery.data ?? [];

	const market = futuresMarkets.find(({ asset }) => asset === position?.asset);

	const { synthsMap } = Connector.useContainer();
	const getSynthDescription = React.useCallback(
		(synth: string) => {
			return t('common.currency.futures-market-short-name', {
				currencyName: synthsMap[synth] ? synthsMap[synth].description : '',
			});
		},
		[t, synthsMap]
	);

	const positionHistory = futuresPositions?.find(({ asset }) => asset === currencyKey);

	return (
		<>
			<Container>
				<DataCol>
					<InfoCol>
						<CurrencyInfo>
							<StyledCurrencyIcon currencyKey={currencyKey} />
							<div>
								<CurrencySubtitle>
									{
										currencyKey ?
											currencyKey?.slice(1)+"-PERP"
											: "Select a market"
									}
								</CurrencySubtitle>
								<StyledValue>{getSynthDescription(currencyKey)}</StyledValue>
							</div>
						</CurrencyInfo>
					</InfoCol>
					<PositionInfoCol>
						<StyledSubtitle>Position Side</StyledSubtitle>
						{positionDetails ?
							<PositionValue side={positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}>
								{positionDetails.side === 'long' ? PositionSide.LONG + " ↗" : PositionSide.SHORT + " ↘"}
							</PositionValue>
							: <StyledValue>{NO_VALUE}</StyledValue>
						}
					</PositionInfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Position Size</StyledSubtitle>
						<StyledValue>
							{positionDetails ?
								formatNumber(
									positionDetails.size ?? 0,
									{
										minDecimals: positionDetails.size.abs().lt(0.01) ? 4 : 2,
									}
								) + " (" +
								formatCurrency(
									Synths.sUSD,
									positionDetails.notionalValue ?? zeroBN,
									{
										sign: '$',
										minDecimals: positionDetails.notionalValue.abs().lt(0.01) ? 4 : 2,
									}
								) + ")"
								: NO_VALUE
							}
						</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Unrealized P&amp;L</StyledSubtitle>
						{positionDetails && market ?
							<StyledValue className={
								positionDetails.profitLoss > zeroBN ? 'green' :
								positionDetails.profitLoss < zeroBN ? 'red' : ""
							}>
								{
									formatCurrency(
										Synths.sUSD,
										positionDetails.profitLoss.add(positionDetails?.accruedFunding),
										{
											sign: '$',
											minDecimals: positionDetails.profitLoss.add(positionDetails?.accruedFunding).abs().lt(0.01) ? 4 : 2,
										}
									) + " (" +
									formatPercent(
										positionDetails.profitLoss.div(
											positionDetails.initialMargin.mul(positionDetails.initialLeverage)
										)
									) + ")"
								}
							</StyledValue>
							: <StyledValue>{NO_VALUE}</StyledValue>
						}
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Leverage</StyledSubtitle>
						<StyledValue>
							{positionDetails ?
								formatNumber(positionDetails?.leverage ?? zeroBN) + "x"
								: NO_VALUE
							}
						</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Liq. Price</StyledSubtitle>
						<StyledValue>
							{positionDetails ?
								formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
									sign: '$',
								})
								: NO_VALUE
							}
						</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Avg. Entry Price</StyledSubtitle>
						<StyledValue>
							{positionDetails ?
								formatCurrency(Synths.sUSD, positionHistory?.entryPrice ?? zeroBN, {
									sign: '$',
								})
								: NO_VALUE
							}
						</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Fees</StyledSubtitle>
						<StyledValue>{NO_VALUE}</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Net Funding</StyledSubtitle>
						{positionDetails ?
							<StyledValue className={
								positionDetails.accruedFunding > zeroBN ? 'green' :
									positionDetails.accruedFunding < zeroBN ? 'red' : ""
							}>
								{
									formatCurrency(Synths.sUSD, positionDetails?.accruedFunding ?? zeroBN, {
										sign: '$',
										minDecimals: positionDetails?.accruedFunding.abs().lt(0.01) ? 4 : 2,
									})
								}
							</StyledValue>
							: <StyledValue>{NO_VALUE}</StyledValue>
						}
					</InfoCol>
				</DataCol>
				<DataCol style={{ justifyContent: 'flex-end' }}>
					{onPositionClose && (
						<CloseButton
							isRounded={true}
							size="sm"
							variant="danger"
							onClick={() => setClosePositionModalIsVisible(true)}
							disabled={!positionDetails}
						>
							{t('futures.market.user.position.close-position')}
						</CloseButton>
					)}
				</DataCol>
			</Container>
			{closePositionModalIsVisible && onPositionClose && (
				<ClosePositionModal
					position={positionDetails}
					currencyKey={currencyKey}
					onPositionClose={onPositionClose}
					onDismiss={() => setClosePositionModalIsVisible(false)}
				/>
			)}
		</>
	);
};
export default PositionCard;

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	grid-gap: 16px;
	background-color: transparent;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 22px;
	border-radius: 16px;
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;

const InfoCol = styled(FlexDivCol)`
	margin-bottom: 8px;

	.green {
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

const StyledSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	margin-bottom: 4px;
`;

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const CloseButton = styled(Button)`
	height: 36px;
	font-size: 13px;
`;

const CurrencySubtitle = styled(StyledSubtitle)`
	text-transform: initial;
`;

const PositionInfoCol = styled(InfoCol)`
	padding-left: 38px;
`;

const PositionValue = styled.p<{ side: PositionSide }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: uppercase;
	margin: 0;
	color: ${(props) => props.theme.colors.common.primaryWhite};

	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.common.primaryGreen};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.common.primaryRed};
		`}
`;

const CurrencyInfo = styled(FlexDiv)`
	align-items: flex-start;
`;
