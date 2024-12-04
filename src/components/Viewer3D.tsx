import { TryOnMode, useZakeke, ZakekeViewer } from '@zakeke/zakeke-configurator-react';
import { Button } from 'components/Atomic';
import ArDeviceSelectionDialog from 'components/dialogs/ArDeviceSelectionDialog';
import RecapPanel from 'components/widgets/RecapPanel';
import {
	findAttribute,
	findGroup,
	findStep,
	launchFullscreen,
	quitFullscreen,
	T,
	useActualGroups,
	useUndoRedoActions
} from 'Helpers';
import { UndoRedoStep } from 'Interfaces';
import { useEffect, useRef, useState } from 'react';
import useStore from 'Store';
import { ReactComponent as BarsSolid } from '../assets/icons/bars-solid.svg';
import { ReactComponent as DesktopSolid } from '../assets/icons/desktop-solid.svg';
import { ReactComponent as ExpandSolid } from '../assets/icons/expand-solid.svg';
import { ReactComponent as DownArrow } from '../assets/icons/double-down-arrow.svg';
import { ReactComponent as CollapseSolid } from '../assets/icons/compress-arrows-alt-solid.svg';
import { ReactComponent as ExplodeSolid } from '../assets/icons/expand-arrows-alt-solid.svg';
import { ReactComponent as ArrowUpSimple } from '../assets/icons/up-arrow-simple.svg';
import { ReactComponent as ArrowDownSimple } from '../assets/icons/down-arrow-simple.svg';
import { ReactComponent as RedoSolid } from '../assets/icons/redo-solid.svg';
import { ReactComponent as ResetSolid } from '../assets/icons/reset-alt-solid.svg';
import { ReactComponent as SearchMinusSolid } from '../assets/icons/search-minus-solid.svg';
import { ReactComponent as SearchPlusSolid } from '../assets/icons/search-plus-solid.svg';
import { ReactComponent as UndoSolid } from '../assets/icons/undo-solid.svg';
import { Dialog, MessageDialog, QuestionDialog, useDialogManager } from './dialogs/Dialogs';
import Notifications from './widgets/Notifications';
import {
	AiIcon,
	ArIcon,
	BottomRightIcons,
	CollapseIcon,
	ExplodeIcon,
	FooterMobileContainer,
	FooterMobileIcon,
	FooterPriceIcon,
	FullscreenArrowIcon,
	FullscreenIcon,
	PriceContainer,
	RecapPanelIcon,
	RedoIcon,
	ResetIcon,
	SecondScreenIcon,
	TopRightIcons,
	UndoIcon,
	ViewerContainer,
	ZoomInIcon,
	ZoomOutIcon
} from './layout/SharedComponents';
import TryOnsButton from 'components/widgets/TryOnsButtons';
import AiDialog from 'components/dialogs/AIDialog';
import NftDialog, { NftForm } from './dialogs/NftDialog';
import QuantityDialog from './dialogs/QuantityDialog';
import ErrorDialog from './dialogs/ErrorDialog';
import ShareDialog from './dialogs/ShareDialog';
import SaveDesignsDraftDialog from './dialogs/SaveDesignsDraftDialog';
import PdfDialog from './dialogs/PdfDialog';
import QuotationFormDialog from './dialogs/QuotationFormDialog';
import useDropdown from 'hooks/useDropdown';
import { TailSpin } from 'react-loader-spinner';
import { ReactComponent as SaveSolid } from '../assets/icons/save-filled.svg';
import { ReactComponent as CartSolid } from '../assets/icons/cart-filler.svg';

// Styled component for the container of the 3D view.
const Viewer3D = () => {
	const ref = useRef<HTMLDivElement | null>(null);
	const addToCartButtonRef = useRef<HTMLDivElement>(null);
	const {
		isSceneLoading,
		IS_IOS,
		IS_ANDROID,
		getMobileArUrl,
		openArMobile,
		isSceneArEnabled,
		zoomIn,
		zoomOut,
		sellerSettings,
		reset,
		openSecondScreen,
		product,
		hasExplodedMode,
		setExplodedMode,
		hasVTryOnEnabled,
		getTryOnSettings,
		isInfoPointContentVisible,
		visibleEventMessages,
		eventMessages,
		isMandatoryPD,
		isAIEnabled,
		nftSettings,
		price,
		useLegacyScreenshot,
		addToCart,
		setCameraByName,
		getPDF,
		groups,
		saveComposition,
		createQuote,
		isAddToCartLoading,
		isOutOfStock,
	} = useZakeke();

	const {
		setIsLoading,
		selectedGroupId,
		setSelectedGroupId,
		selectedAttributeId,
		setSelectedTemplateGroupId,
		selectedTemplateGroupId,
		selectedStepId,
		setSelectedAttributeId,
		priceFormatter,
		setIsQuoteLoading,
		isQuoteLoading,
		isViewerMode,
		isDraftEditor,
		isEditorMode,
		setTryOnMode,
		tryOnRef,
		setIsPDStartedFromCart,
		pdValue,
		isMobile,
		setSelectedStepId,
	} = useStore();

	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isRecapPanelOpened, setRecapPanelOpened] = useState(
		sellerSettings?.isCompositionRecapVisibleFromStart ?? false
	);

	const [openOutOfStockTooltip, , isOutOfStockTooltipVisible, Dropdown] = useDropdown();
	const { showDialog, closeDialog } = useDialogManager();
	const { notifications, removeNotification } = useStore();

	useEffect(() => {
		if (sellerSettings && sellerSettings?.isCompositionRecapVisibleFromStart)
			setRecapPanelOpened(sellerSettings.isCompositionRecapVisibleFromStart);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sellerSettings]);

	const switchFullscreen = () => {
		if (
			(document as any).fullscreenElement ||
			(document as any).webkitFullscreenElement ||
			(document as any).mozFullScreenElement ||
			(document as any).msFullscreenElement
		) {
			quitFullscreen(ref.current!);
		} else {
			launchFullscreen(ref.current!);
		}
	};
	const switchFullscreenArrows = () => {
		if (
			(document as any).fullscreenElement ||
			(document as any).webkitFullscreenElement ||
			(document as any).mozFullScreenElement ||
			(document as any).msFullscreenElement
		) {
			quitFullscreen(ref.current!);
			setIsFullscreen(false);
		} else {
			launchFullscreen(ref.current!);
			setIsFullscreen(true);
		}
	};


	const handleArClick = async (arOnFlyUrl: string) => {
		if (IS_ANDROID || IS_IOS) {
			setIsLoading(true);
			const link = new URL(arOnFlyUrl, window.location.href);
			const url = await getMobileArUrl(link.href);
			setIsLoading(false);
			if (url)
				if (IS_IOS) {
					openArMobile(url as string);
				} else if (IS_ANDROID) {
					showDialog(
						'open-ar',
						<Dialog>
							<Button
								style={{ display: 'block', width: '100%' }}
								onClick={() => {
									closeDialog('open-ar');
									openArMobile(url as string);
								}}
							>
								{T._('See your product in AR', 'Composer')}
							</Button>
						</Dialog>
					);
				}
		} else {
			showDialog('select-ar', <ArDeviceSelectionDialog />);
		}
	};

	const { setIsUndo, undoStack, setIsRedo, redoStack } = useStore();
	const undoRedoActions = useUndoRedoActions();

	const handleUndoClick = () => {
		setIsUndo(true);

		let actualUndoStep = undoStack.length > 0 ? undoStack.pop() : null;
		if (actualUndoStep && actualUndoStep.length > 0) {
			undoRedoActions.fillRedoStack(actualUndoStep);
			actualUndoStep
				.filter((x: UndoRedoStep) => x.direction === 'undo')
				.forEach((singleStep: UndoRedoStep) => handleUndoSingleStep(singleStep));
		}

		setIsUndo(false);
	};

	const { undo, redo } = useZakeke();

	const actualGroups = useActualGroups() ?? [];

	const handleUndoSingleStep = (actualUndoStep: UndoRedoStep) => {
		if (actualUndoStep.id === null && !isMobile) return;
		if (actualUndoStep.type === 'group')
			return setSelectedGroupId(findGroup(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'step')
			return setSelectedStepId(findStep(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'attribute')
			return setSelectedAttributeId(findAttribute(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'option') {
			return undo();
		}
	};

	const handleRedoClick = () => {
		setIsRedo(true);

		let actualRedoStep = redoStack.length > 0 ? redoStack.pop() : null;
		if (actualRedoStep != null) {
			undoRedoActions.fillUndoStack(actualRedoStep);
			actualRedoStep
				.filter((x: UndoRedoStep) => x.direction === 'redo')
				.forEach(async (singleStep: UndoRedoStep) => handleRedoSingleStep(singleStep));
		}

		setIsRedo(false);
	};

	const handleRedoSingleStep = (actualRedoStep: { type: string; id: number | null; direction: string }) => {
		if (actualRedoStep.id === null && !isMobile) return;
		if (actualRedoStep.type === 'group')
			return setSelectedGroupId(findGroup(actualGroups, actualRedoStep.id)?.id ?? null);
		if (actualRedoStep.type === 'step')
			return setSelectedStepId(findStep(actualGroups, actualRedoStep.id)?.id ?? null);
		else if (actualRedoStep.type === 'attribute')
			return setSelectedAttributeId(findAttribute(actualGroups, actualRedoStep.id)?.id ?? null);
		else if (actualRedoStep.type === 'option') return redo();
	};


	const isBuyVisibleForQuoteRule = product?.quoteRule ? product.quoteRule.allowAddToCart : true;

	const [disableButtonsByVisibleMessages, setDisableButtonsByVisibleMessages] = useState(false);

	useEffect(() => {
		if (visibleEventMessages && visibleEventMessages.some((msg) => msg.addToCartDisabledIfVisible))
			setDisableButtonsByVisibleMessages(true);
		else setDisableButtonsByVisibleMessages(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visibleEventMessages]);

	const handleAddToCart = () => {
		const cartMessage = eventMessages?.find((message) => message.eventID === 4);
		if (isMandatoryPD && pdValue < 1) {
			setIsPDStartedFromCart(true);
			tryOnRef?.current?.setVisible?.(true);
			tryOnRef?.current?.changeMode?.(TryOnMode.PDTool);
			setTryOnMode(TryOnMode.PDTool);
			return;
		}
		if (cartMessage && cartMessage.visible && !isDraftEditor && !isEditorMode)
			showDialog(
				'question',
				<QuestionDialog
					alignButtons='center'
					eventMessage={cartMessage?.description}
					buttonNoLabel={T._('Cancel', 'Composer')}
					buttonYesLabel={T._('Add to cart', 'Composer')}
					onYesClick={() => {
						if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor)
							showDialog(
								'nft',
								<NftDialog
									nftTitle={T._(
										"You're purchasing a customized product together with an NFT.",
										'Composer'
									)}
									nftMessage={T._(
										'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
										'Composer'
									)}
									buttonNoLabel={T._('Skip and continue', 'Composer')}
									buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
									price={nftSettings.priceToAdd + price}
									onYesClick={(nftForm: NftForm) => {
										closeDialog('nft');
										addToCart([], undefined, useLegacyScreenshot, nftForm);
									}}
									onNoClick={() => {
										closeDialog('nft');
										addToCart([], undefined, useLegacyScreenshot);
									}}
								/>
							);
						else addToCart([], undefined, useLegacyScreenshot);
						closeDialog('question');
					}}
				/>
			);
		else if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor)
			showDialog(
				'nft',
				<NftDialog
					nftTitle={T._("You're purchasing a customized product together with an NFT.", 'Composer')}
					nftMessage={T._(
						'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
						'Composer'
					)}
					price={nftSettings.priceToAdd + price}
					buttonNoLabel={T._('Skip and continue', 'Composer')}
					buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
					onYesClick={(nftForm: NftForm) => {
						closeDialog('nft');
						addToCart([], undefined, useLegacyScreenshot, nftForm);
					}}
					onNoClick={() => {
						closeDialog('nft');
						addToCart([], undefined, useLegacyScreenshot);
					}}
				/>
			);
		else if (product && product.quantityRule)
			showDialog(
				'quantity',
				<QuantityDialog
					quantityRule={product.quantityRule}
					onClick={() => {
						closeDialog('quantity');
						addToCart([], undefined, useLegacyScreenshot);
					}}
				/>
			);
		else {
			addToCart([], undefined, useLegacyScreenshot);
		}
	};

	const showError = (error: string) => {
		showDialog('error', <ErrorDialog error={error} onCloseClick={() => closeDialog('error')} />);
	};

	const handleShareClick = async () => {
		setCameraByName('buy_screenshot_camera', false, false);
		showDialog('share', <ShareDialog />);
	};
	const handleSaveClick = async () => {
		showDialog('save', <SaveDesignsDraftDialog onCloseClick={() => closeDialog('save')} />);
	};
	const handlePdfClick = async () => {
		try {
			setIsLoading(true);
			const url = await getPDF();
			showDialog('pdf', <PdfDialog url={url} onCloseClick={() => closeDialog('pdf')} />);
		} catch (ex) {
			console.log(ex);
			showError(T._('Failed PDF generation', 'Composer'));
		} finally {
			setIsLoading(false);
		}
	};
	const handleBackClick = () => {
		if (selectedAttributeId) {
			setSelectedAttributeId(null);

			const selectedCurrentGroup = groups.find((x) => x.id === selectedGroupId);
			const selectedCurrentStep = selectedCurrentGroup?.steps.find((x) => x.id === selectedStepId);

			if (
				selectedCurrentGroup &&
				((selectedCurrentGroup.attributes.length === 1 && selectedCurrentGroup.templateGroups.length === 0) ||
					(selectedCurrentStep?.attributes.length === 1 && selectedCurrentStep.templateGroups.length === 0))
			) {
				setSelectedGroupId(null);
			}
		} else if (selectedTemplateGroupId) {
			console.log('selectedTemplateGroupId');
			setSelectedTemplateGroupId(null);

			const selectedCurrentGroup = groups.find((x) => x.id === selectedGroupId);
			const selectedCurrentStep = selectedCurrentGroup?.steps.find((x) => x.id === selectedStepId);

			if (
				selectedCurrentGroup &&
				((selectedCurrentGroup.templateGroups.length === 1 && selectedCurrentGroup.attributes.length === 0) ||
					(selectedCurrentStep?.templateGroups.length === 1 && selectedCurrentStep.attributes.length === 0))
			) {
				setSelectedGroupId(null);
			}
		} else if (selectedGroupId) {
			setSelectedGroupId(null);
		}
	};

	const handleSubmitRequestQuote = async (formData: any) => {
		let thereIsARequiredFormEmpty = formData.some((form: any) => form.required && form.value === '');
		if (thereIsARequiredFormEmpty)
			showDialog(
				'error',
				<ErrorDialog
					error={T._(
						'Failed to send the quotation since there is at least 1 required field empty.',
						'Composer'
					)}
					onCloseClick={() => closeDialog('error')}
				/>
			);
		else
			try {
				closeDialog('request-quotation');
				setIsQuoteLoading(true);
				setCameraByName('buy_screenshot_camera', false, false);
				await saveComposition();
				await createQuote(formData);
				showDialog(
					'message',
					<MessageDialog message={T._('Request for quotation sent successfully', 'Composer')} />
				);
				setIsQuoteLoading(false);
			} catch (ex) {
				console.error(ex);
				setIsQuoteLoading(false);
				showDialog(
					'error',
					<ErrorDialog
						error={T._(
							'An error occurred while sending request for quotation. Please try again.',
							'Composer'
						)}
						onCloseClick={() => closeDialog('error')}
					/>
				);
			}
	};

	const handleGetQuoteClick = async () => {
		let rule = product?.quoteRule;
		if (rule)
			showDialog(
				'request-quotation',
				<QuotationFormDialog getQuoteRule={rule} onFormSubmit={handleSubmitRequestQuote} />
			);
	};


	return (
		<ViewerContainer ref={ref}>
			{!isSceneLoading && <ZakekeViewer bgColor='#f2f2f2' />}

			{!isSceneLoading && (
				<>
					<FooterMobileContainer $isMobile={isMobile} isQuoteEnable={product?.quoteRule !== null}>
						{/* {!isDraftEditor &&
						!isEditorMode &&
						!isViewerMode &&
						sellerSettings &&
						sellerSettings.canSaveDraftComposition && ( */}
						<FooterMobileIcon isSaved gridArea='save' onClick={handleSaveClick}>
							<SaveSolid />
						</FooterMobileIcon>
						{/* )} */}

						{/* {!isEditorMode && sellerSettings && sellerSettings.shareType !== 0 && (
						<FooterMobileIcon gridArea='share' onClick={handleShareClick}>
							<ShareSolid />
						</FooterMobileIcon>
					)} */}

						{/* {isBuyVisibleForQuoteRule && !isViewerMode && ( */}
						<FooterMobileIcon
							isCart
							iconColor='white'
							color='white'
							ref={addToCartButtonRef}
							onPointerEnter={() => {
								if (isOutOfStock) openOutOfStockTooltip(addToCartButtonRef.current!, 'top', 'top');
							}}
							disabled={disableButtonsByVisibleMessages || isAddToCartLoading || isOutOfStock}
							// backgroundColor='#313c46'
							onClick={!isAddToCartLoading ? () => handleAddToCart() : () => null}
						>
							{isOutOfStock && T._('OUT OF STOCK', 'Composer')}

							{!isOutOfStock &&
								!isAddToCartLoading &&
								(isDraftEditor || isEditorMode ? <SaveSolid /> : <CartSolid />)}
							{isAddToCartLoading && <TailSpin color='#FFFFFF' height='25px' />}
						</FooterMobileIcon>
						{/* )} */}
						{/* {product?.quoteRule && !isViewerMode && !isDraftEditor && !isEditorMode && (
						<FooterMobileIcon
							gridArea='quote'
							iconColor='white'
							color='white'
							style={{ fontSize: '14px' }}
							backgroundColor='#313c46'
							disabled={disableButtonsByVisibleMessages}
							onClick={handleGetQuoteClick}
						>
							{!isQuoteLoading && (
								<>
									<QuoteSolid />
									{T._('Get a Quote', 'Composer')}
								</>
							)}
							{isQuoteLoading && <TailSpin color='#FFFFFF' height='25px' />}
						</FooterMobileIcon>
					)} */}
					</FooterMobileContainer>
					<FooterPriceIcon $isMobile={isMobile} isPrice color='black'>
						{/* {!isOutOfStock &&
								price !== null &&
								price > 0 &&
								(!sellerSettings || !sellerSettings.hidePrice) && ( */}
						<PriceContainer style={{ fontSize: '18px', color: 'black', display: 'flex', }} $isMobile={isMobile}>
							<DownArrow style={{
								height: '24px',
								width: '24px',
								paddingTop: '4px'
							}} />{priceFormatter.format(price)}
						</PriceContainer>
						{/* )} */}
					</FooterPriceIcon>
				</>
			)}

			{!isInfoPointContentVisible && (
				<>
					<ZoomInIcon $isMobile={isMobile} key={'zoomin'} hoverable onClick={zoomIn}>
						<SearchPlusSolid />
					</ZoomInIcon>
					<ZoomOutIcon $isMobile={isMobile} key={'zoomout'} hoverable onClick={zoomOut}>
						<SearchMinusSolid />
					</ZoomOutIcon>
					{sellerSettings?.canUndoRedo && (
						<ResetIcon $isMobile={isMobile} key={'reset'} hoverable onClick={reset}>
							<ResetSolid />
						</ResetIcon>
					)}
					{sellerSettings?.canUndoRedo && (
						<UndoIcon $isMobile={isMobile} key={'undo'} hoverable onClick={handleUndoClick}>
							<UndoSolid />
						</UndoIcon>
					)}
					{sellerSettings?.canUndoRedo && (
						<RedoIcon $isMobile={isMobile} key={'redo'} hoverable onClick={handleRedoClick}>
							<RedoSolid />
						</RedoIcon>
					)}
					{!isSceneLoading && hasVTryOnEnabled && <TryOnsButton settings={getTryOnSettings()} />}
					<BottomRightIcons $isMobile={isMobile}>
						{hasExplodedMode() && product && !isSceneLoading && (
							<>
								<CollapseIcon hoverable onClick={() => setExplodedMode(false)}>
									<CollapseSolid />
								</CollapseIcon>
								<ExplodeIcon $isMobile={isMobile} hoverable onClick={() => setExplodedMode(true)}>
									<ExplodeSolid />
								</ExplodeIcon>
							</>
						)}

						{product && product.isShowSecondScreenEnabled && (
							<SecondScreenIcon key={'secondScreen'} hoverable onClick={openSecondScreen}>
								<DesktopSolid />
							</SecondScreenIcon>
						)}

						{!IS_IOS && (
							<FullscreenIcon
								className='fullscreen-icon'
								key={'fullscreen'}
								hoverable
								onClick={switchFullscreen}
							>
								<ExpandSolid />
							</FullscreenIcon>
						)}
					</BottomRightIcons>

					{!IS_IOS && (
						<FullscreenArrowIcon
							$isMobile={isMobile}
							className='fullscreen-icon'
							key={'fullscreen'}
							hoverable
							onClick={switchFullscreenArrows}
						>

							{isFullscreen ? <ArrowUpSimple /> : <ArrowDownSimple />}
						</FullscreenArrowIcon>
					)}
					<TopRightIcons $isMobile={isMobile}>
						{product && product.isAiConfigurationEnabled && isAIEnabled && (
							<AiIcon
								$isArIconVisible={isSceneArEnabled()}
								onClick={() => showDialog('ai', <AiDialog />)}
							>
							</AiIcon>
						)}

						{isSceneArEnabled() && <ArIcon onClick={() => handleArClick('ar.html')} />}
					</TopRightIcons>
					{sellerSettings?.isCompositionRecapEnabled && (
						<RecapPanelIcon $isMobile={isMobile} key={'recap'} onClick={() => setRecapPanelOpened(!isRecapPanelOpened)}>
							<BarsSolid />
						</RecapPanelIcon>
					)}
					{sellerSettings?.isCompositionRecapEnabled && isRecapPanelOpened && (
						<RecapPanel key={'recapPanel'} onClose={() => setRecapPanelOpened(false)} />
					)}{' '}
				</>
			)}

			{/* Notifications */}
			<Notifications
				notifications={notifications}
				onRemoveNotificationClick={(notification) => removeNotification(notification.id)}
			/>
		</ViewerContainer>
	);
};

export default Viewer3D;
