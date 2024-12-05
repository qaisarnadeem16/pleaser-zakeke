import { Option, Step, ThemeTemplateGroup, useZakeke } from '@zakeke/zakeke-configurator-react';
import { T, useActualGroups, useUndoRedoActions, useUndoRegister } from 'Helpers';
import { Map } from 'immutable';
import { useEffect, useState } from 'react';
import useStore from 'Store';
import styled from 'styled-components';
import savedCompositionsIcon from '../../assets/icons/saved_designs.svg';
import star from '../../assets/icons/star.svg';
import noImage from '../../assets/images/no_image.png';
import Designer from '../layout/Designer';
import DesignsDraftList from '../layout/DesignsDraftList';
import { ItemName, Template, TemplatesContainer } from '../layout/SharedComponents';
import Steps from '../layout/Steps';
import { MenuItem, MobileItemsContainer } from './MobileMenuComponents';
import TemplateGroup from 'components/TemplateGroup';

import { ReactComponent as ArrowLeftIcon } from '../../assets/icons/arrow-left-solid.svg';
import { ReactComponent as ArrowRightIcon } from '../../assets/icons/arrow-right-solid.svg';
import { MenuItem2 } from './sub-menu-item';

// Styled component for the container of the mobile menu
export const MobileMenuContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	position: relative;
	overflow: auto;
`;

// Styled component for the container of the steps
export const StepsMobileContainer = styled.div`
	height: 45px;
`;

// Styled component for the container of the price info text
const PriceInfoTextContainer = styled.div`
	font-size: 14px;
	padding: 0px 10px;
`;

// MobileMenu component that represents the mobile menu where
// the customer can select the attributes and options
const MobileMenu = () => {
	const {
		isSceneLoading,
		templates,
		currentTemplate,
		setCamera,
		setTemplate,
		sellerSettings,
		selectOption,
		draftCompositions
	} = useZakeke();
	const {
		selectedGroupId,
		setSelectedGroupId,
		selectedAttributeId,
		setSelectedAttributeId,
		selectedStepId,
		setSelectedStepId,
		isUndo,
		isRedo,
		setSelectedTemplateGroupId,
		selectedTemplateGroupId,
		lastSelectedItem,
		setLastSelectedItem
	} = useStore();
	const [scrollLeft, setScrollLeft] = useState<number | null>(null);
	const [optionsScroll, setOptionsScroll] = useState<number | null>(null);
	const [attributesScroll, setAttributesScroll] = useState<number | null>(null);
	const [isTemplateEditorOpened, setIsTemplateEditorOpened] = useState(false);
	const [isDesignsDraftListOpened, setisDesignsDraftListOpened] = useState(false);
	const [isTemplateGroupOpened, setIsTemplateGroupOpened] = useState(false);
	const [isStartRegistering, setIsStartRegistering] = useState(false);
	const undoRegistering = useUndoRegister();
	const undoRedoActions = useUndoRedoActions();

	const actualGroups = useActualGroups() ?? [];

	const selectedGroup = selectedGroupId ? actualGroups.find((group) => group.id === selectedGroupId) : null;
	const selectedStep = selectedGroupId
		? actualGroups.find((group) => group.id === selectedGroupId)?.steps.find((step) => step.id === selectedStepId)
		: null;
	const currentAttributes = selectedStep ? selectedStep.attributes : selectedGroup ? selectedGroup.attributes : [];
	const currentTemplateGroups = selectedStep
		? selectedStep.templateGroups
		: selectedGroup
			? selectedGroup.templateGroups
			: [];

	const currentItems = [...currentAttributes, ...currentTemplateGroups].sort(
		(a, b) => a.displayOrder - b.displayOrder
	);

	const selectedAttribute = currentAttributes
		? currentAttributes.find((attr) => attr.id === selectedAttributeId)
		: null;

	const selectedTemplateGroup = currentTemplateGroups
		? currentTemplateGroups.find((templGr) => templGr.templateGroupID === selectedTemplateGroupId)
		: null;

	const options = selectedAttribute?.options ?? [];
	const groupIndex = actualGroups && selectedGroup ? actualGroups.indexOf(selectedGroup) : 0;

	const [lastSelectedSteps, setLastSelectedSteps] = useState(Map<number, number>());

	// const handleNextGroup = () => {
	// 	if (selectedGroup) {
	// 		if (groupIndex < actualGroups.length - 1) {
	// 			const nextGroup = actualGroups[groupIndex + 1];
	// 			handleGroupSelection(nextGroup.id);
	// 		}
	// 	}
	// };

	// const handlePreviousGroup = () => {
	// 	if (selectedGroup) {
	// 		if (groupIndex > 0) {
	// 			let previousGroup = actualGroups[groupIndex - 1];
	// 			handleGroupSelection(previousGroup.id);

	// 			// Select the last step
	// 			if (previousGroup.steps.length > 0)
	// 				handleStepSelection(previousGroup.steps[previousGroup.steps.length - 1].id);
	// 		}
	// 	}
	// };

	const handleStepChange = (step: Step | null) => {
		if (step) handleStepSelection(step.id);
	};



	const handleStepSelection = (stepId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (selectedStepId !== stepId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'step', id: selectedStepId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'step', id: stepId ?? null, direction: 'redo' });
		}

		setSelectedStepId(stepId);

		const newStepSelected = lastSelectedSteps.set(selectedGroupId!, stepId!);
		setLastSelectedSteps(newStepSelected);
	};

	const handleAttributeSelection = (attributeId: number) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (attributeId && selectedAttributeId !== attributeId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'attribute', id: selectedAttributeId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'attribute', id: attributeId, direction: 'redo' });
		}

		setSelectedAttributeId(attributeId);
		setLastSelectedItem({ type: 'attribute', id: attributeId });
	};

	const handleTemplateGroupSelection = (templateGroupId: number | null) => {
		setSelectedTemplateGroupId(templateGroupId);
		setLastSelectedItem({ type: 'template-group', id: templateGroupId });
		setIsTemplateGroupOpened(true);
	};

	const handleOptionSelection = (option: Option) => {
		const undo = undoRegistering.startRegistering();
		undoRedoActions.eraseRedoStack();
		undoRedoActions.fillUndoStack({
			type: 'option',
			id: options.find((opt) => opt.selected)?.id ?? null,
			direction: 'undo'
		});
		undoRedoActions.fillUndoStack({ type: 'option', id: option.id, direction: 'redo' });

		selectOption(option.id);
		undoRegistering.endRegistering(undo);

		try {
			if ((window as any).algho) (window as any).algho.sendUserStopForm(true);
		} catch (e) { }
	};

	const setTemplateByID = async (templateID: number) => await setTemplate(templateID);
	// Initial template selection
	useEffect(() => {
		if (templates.length > 0 && !currentTemplate) setTemplateByID(templates[0].id);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templates]);

	// auto-selection if there is only 1 group
	useEffect(() => {
		if (actualGroups && actualGroups.length === 1 && actualGroups[0].id === -2) return;
		else if (actualGroups && actualGroups.length === 1 && !selectedGroupId) setSelectedGroupId(actualGroups[0].id);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actualGroups, selectedGroupId]);

	// Reset attribute selection when group selection changes
	useEffect(() => {
		if (selectedGroup && selectedGroup.id !== -2) {
			if (selectedGroup.steps.length > 0) {
				if (lastSelectedSteps.get(selectedGroupId!))
					handleStepSelection(lastSelectedSteps.get(selectedGroupId!)!);
				else {
					handleStepSelection(selectedGroup.steps[0].id);
					if (
						selectedGroup.steps[0].attributes.length === 1 &&
						selectedGroup.steps[0].templateGroups.length === 0
					)
						handleAttributeSelection(selectedGroup.steps[0].attributes[0].id);
					else if (
						selectedGroup.steps[0].templateGroups.length === 1 &&
						selectedGroup.steps[0].attributes.length === 0
					)
						handleTemplateGroupSelection(selectedGroup.steps[0].templateGroups[0].templateGroupID);
				}
			} else {
				handleStepSelection(null);
				if (selectedGroup.attributes.length === 1 && selectedGroup.templateGroups.length === 0)
					handleAttributeSelection(selectedGroup.attributes[0].id);
				else if (selectedGroup.templateGroups.length === 1 && selectedGroup.attributes.length === 0)
					handleTemplateGroupSelection(selectedGroup.templateGroups[0].templateGroupID);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroup?.id]);

	useEffect(() => {
		if (selectedGroup?.id === -2) {
			setIsTemplateEditorOpened(true);
		}
	}, [selectedGroup?.id]);

	useEffect(() => {
		if (selectedGroup?.id === -3) {
			setisDesignsDraftListOpened(true);
		}
	}, [selectedGroup?.id]);

	// Camera
	useEffect(() => {
		if (!isSceneLoading && selectedGroup && selectedGroup.cameraLocationId) {
			setCamera(selectedGroup.cameraLocationId, true);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroup?.id, isSceneLoading]);

	useEffect(() => {
		if (selectedGroup && selectedGroup.steps.length > 0) {
			if (
				selectedGroup.steps.find((step) => step.id === selectedStep?.id) &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.attributes.length === 1 &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.templateGroups.length === 0
			)
				handleAttributeSelection(
					selectedGroup.steps!.find((step) => step.id === selectedStep?.id)!.attributes[0].id
				);
			else setSelectedAttributeId(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedStep?.id]);

	useEffect(() => {
		if (isStartRegistering) {
			undoRegistering.endRegistering(false);
			setIsStartRegistering(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isStartRegistering]);

	const [activeGroupIndex, setActiveGroupIndex] = useState(0);

	useEffect(() => {
		if (isStartRegistering) {
			undoRegistering.endRegistering(false);
			setIsStartRegistering(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isStartRegistering]);


	useEffect(() => {
		if (!actualGroups || actualGroups.length === 0) return;

		// If only one group exists, handle special and default cases
		if (actualGroups.length === 1) {
			if (actualGroups[0].id !== -2 && !selectedGroupId) {
				setSelectedGroupId(actualGroups[0].id);
			}
			return;
		}

		// If multiple groups exist and no group is selected, default to the first group
		if (!selectedGroupId && actualGroups[0]?.id) {
			setSelectedGroupId(actualGroups[0].id);
		}
	}, [actualGroups, selectedGroupId]);


	const handleGroupSelection = (groupId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (groupId && selectedGroupId !== groupId) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'group', id: selectedGroupId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'group', id: groupId, direction: 'redo' });
		}

		setSelectedGroupId(groupId);
	};

	const handleNextGroup = () => {
		if (activeGroupIndex < actualGroups.length - 1) {
			setActiveGroupIndex(activeGroupIndex + 1);
			handleGroupSelection(actualGroups[activeGroupIndex + 1].id); // Call handleGroupSelection
		}
	};

	const handlePreviousGroup = () => {
		if (activeGroupIndex > 0) {
			setActiveGroupIndex(activeGroupIndex - 1);
			handleGroupSelection(actualGroups[activeGroupIndex - 1].id); // Call handleGroupSelection
		}
	};

	const [activeIndex, setActiveIndex] = useState(0);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	const handleScroll = () => {
		const scrollableElement = document.querySelector('.scroll-snap-x');
		if (scrollableElement) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollableElement;
			// Show Left Arrow if not at the start
			setShowLeftArrow(scrollLeft > 0);

			// Show Right Arrow if not at the end
			setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
		}
	};

	const handlePrevious = (item: any) => {
		if (activeIndex > 0) {
			const newIndex = activeIndex - 1;
			setActiveIndex(newIndex);
			handleOptionSelection(item.options[newIndex]);
		}
	};

	const handleNext = (item: any) => {
		if (activeIndex < item.options?.length - 1) {
			const newIndex = activeIndex + 1;
			setActiveIndex(newIndex);
			handleOptionSelection(item.options[newIndex]);
		}
	};

	
	// console.log('currentItems', currentItems)
	// console.log('selectedAttribute', selectedAttribute)
	// console.log('selectOption', selectedAttribute)
	return (
		<MobileMenuContainer>
			{sellerSettings && sellerSettings.priceInfoText && (
				<PriceInfoTextContainer dangerouslySetInnerHTML={{ __html: sellerSettings.priceInfoText }} />
			)}


			<div className="flex justify-center bg-gray-50 w-full items-center">
				{actualGroups.length > 0 && (
					<div className="flex justify-center w-full items-center">
						{/* Previous Button */}
						<button
							onClick={handlePreviousGroup}
							disabled={activeGroupIndex === 0} // Disable if it's the first group
							className="z-10  "
						>
							{activeGroupIndex !== 0 && <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1L1 6.7037L7 12" stroke="black" stroke-linecap="round"></path><path d="M13 1.00049L7 6.70419L13 12.0005" stroke="black" stroke-width="2" stroke-linecap="round"></path></svg>}

						</button>

						{/* Active Group */}
						<div
							key={actualGroups[activeGroupIndex].guid}
							className=" py-1 px-5 flex justify-center items-center"
						>
							<button onClick={() => handleGroupSelection(actualGroups[activeGroupIndex].id)} className="text-xl font-bold text-black leading-relaxed tracking-wide">
								{actualGroups[activeGroupIndex].name
									? T._d(actualGroups[activeGroupIndex].name)
									: T._('Customize', 'Composer')}
							</button>
						</div>

						{/* Next Button */}
						<button
							onClick={handleNextGroup}
							disabled={activeGroupIndex === actualGroups.length - 1} // Disable if it's the last group
							className=" z-10"
						>
							{activeGroupIndex !== actualGroups.length - 1 &&
								<svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1L13 6.7037L7 12" stroke="black" stroke-linecap="round"></path><path d="M1 1.00049L7 6.70419L1 12.0005" stroke="black" stroke-width="2" stroke-linecap="round"></path></svg>}
						</button>
					</div>
				)}
			</div>

			{selectedGroup && selectedGroup.id !== -2 && selectedGroup.steps && selectedGroup.steps.length > 0 && (
				<StepsMobileContainer>
					<Steps
						key={'steps-' + selectedGroup?.id}
						hasNextGroup={groupIndex !== actualGroups.length - 1}
						hasPreviousGroup={groupIndex !== 0}
						onNextStep={handleNextGroup}
						onPreviousStep={handlePreviousGroup}
						currentStep={selectedStep}
						steps={selectedGroup.steps}
						onStepChange={handleStepChange}
					/>
				</StepsMobileContainer>
			)}

			{/* <MobileItemsContainer2
				isLeftArrowVisible
				isRightArrowVisible
				scrollLeft={scrollLeft ?? 0}
				onScrollChange={(value) => setScrollLeft(value)}
			>
				{actualGroups.map((group) => {
					if (group)
						return (
							<MenuItem2
								key={group.guid}
								imageUrl={
									group.id === -3 ? savedCompositionsIcon : group.imageUrl ? group.imageUrl : star
								}
								label={group.name ? T._d(group.name) : T._('Customize', 'Composer')}
								onClick={() => handleGroupSelection(group.id)}
							></MenuItem2>
						);
					else return null;
				})}
			</MobileItemsContainer2> */}




			{/* <AttributesContainer > */}
			{selectedGroup && selectedGroup.id === -2 && templates.length > 1 && (
				<TemplatesContainer>
					{templates.map((template) => (
						<Template
							key={template.id}
							selected={currentTemplate === template}
							onClick={async () => {
								await setTemplate(template.id);
							}}
						>
							{T._d(template.name)}
						</Template>
					))}
				</TemplatesContainer>
			)}

			{selectedGroup && (selectedGroup.name !== "PANEL" && selectedGroup.name !== "BOTTOM") && (
				<MobileItemsContainer
					isLeftArrowVisible
					isRightArrowVisible
					scrollLeft={attributesScroll ?? 0}
					onScrollChange={(value) => setAttributesScroll(value)}
				>
					{/* Attributes */}

					{selectedGroup &&
						!selectedAttributeId &&
						!selectedTemplateGroupId &&
						currentItems &&
						currentItems.map((item) => {
							if (!(item instanceof ThemeTemplateGroup))
								return (
									<MenuItem
										selected={item.id === selectedAttributeId}
										key={item.guid}
										onClick={() => handleAttributeSelection(item.id)}
										images={item.options
											.slice(0, 4)
											.map((x) => (x.imageUrl ? x.imageUrl : noImage))}
										label={T._d(item.name)}
										isRound={item.optionShapeType === 2}
									>
										<ItemName> {T._d(item.name).toUpperCase()} </ItemName>
									</MenuItem>
								);
							else
								return (
									<MenuItem
										selected={item.templateGroupID === selectedTemplateGroupId}
										key={item.templateGroupID}
										onClick={() => handleTemplateGroupSelection(item.templateGroupID)}
										imageUrl={noImage}
										label={T._d(item.name)}
										isRound={false}
									>
										<ItemName> {T._d(item.name).toUpperCase()} </ItemName>
									</MenuItem>
								);
						})}
					{/* </CarouselContainer> */}

					{/* Options */}
					<MobileItemsContainer
						isLeftArrowVisible={options.length !== 0}
						isRightArrowVisible={options.length !== 0}
						scrollLeft={optionsScroll ?? 0}
						onScrollChange={(value) => setOptionsScroll(value)}
					>
						{lastSelectedItem?.type === 'attribute' ? (
							<>
								{selectedAttribute &&
									selectedAttribute.options.map(
										(option) =>
											option.enabled && (
												<MenuItem
													isRound={selectedAttribute.optionShapeType === 2}
													description={option.description}
													selected={option.selected}
													imageUrl={option.imageUrl ?? ''}
													label={T._d(option.name)}
													hideLabel={selectedAttribute.hideOptionsLabel}
													key={option.guid}
													onClick={() => handleOptionSelection(option)}
												/>
											)
									)}
							</>
						) : (
							selectedTemplateGroup &&
							isTemplateGroupOpened && (
								<TemplateGroup
									key={selectedTemplateGroupId}
									templateGroup={selectedTemplateGroup!}
									isMobile
									onCloseClick={() => {
										setIsTemplateGroupOpened(false);
										handleTemplateGroupSelection(null);
										handleGroupSelection(null);
									}}
								/>
							)
						)}
					</MobileItemsContainer>
				</MobileItemsContainer>
			)}




			{selectedGroup && (selectedGroup.name === "PANEL" || selectedGroup.name === "BOTTOM") && (
				<>
					{/* Attributes */}
					<>
						{selectedGroup &&
							!selectedAttribute &&
							!selectedTemplateGroupId &&
							currentItems &&
							currentItems.map((item) => {
								if (!(item instanceof ThemeTemplateGroup)) {
									return (

										<div key={item.guid} >
											{item.name === "Color Variant" ?
												<MobileItemsContainer
													isLeftArrowVisible
													isRightArrowVisible
													scrollLeft={attributesScroll ?? 0}
													onScrollChange={(value) => setAttributesScroll(value)}
												>
													<div style={{ display: 'flex', gap: '.5rem', }} className=' w-full'>
														{item.options.map((option) => {
															const optionKey = `option-${option.guid}`;
															const isSelected = option.selected; // Check if the option is selected
															return (
																<div key={option.guid}>
																	<MenuItem
																		key={optionKey}
																		isRound={item.optionShapeType === 2}
																		description={option.description}
																		selected={isSelected}
																		imageUrl={option.imageUrl ?? noImage}
																		label={T._d(option.name)}
																		onClick={() => handleOptionSelection(option)}
																		hideLabel={item.hideOptionsLabel}
																	/>
																</div>
															);
														})}
													</div>
												</MobileItemsContainer>
												:
												<div className="max-w-full bg-transparent px-5 flex justify-center items-center relative">
													{/* Previous Button */}
													{showLeftArrow && (
														<button
															onClick={() => handlePrevious(item)}
															className="z-10 mb-4 h-6 w-6 bg-slate-100 flex items-center justify-center rounded-full absolute left-2"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 1024 1024"
																width="45px"
																height="45px"
																fill="#000000"
																transform="rotate(180)"
															>
																<path d="M419.3 264.8l-61.8 61.8L542.9 512 357.5 697.4l61.8 61.8L666.5 512z" />
															</svg>
														</button>
													)}

													{/* Options List */}
													<div
														className="flex gap-4 mx-auto py-1 overflow-x-auto scroll-snap-x no-scrollbar"
														onScroll={handleScroll}
													>
														{item.options.map((option, i) => (
															<div
																key={i}
																className="flex flex-col justify-center cursor-pointer"
																onClick={() => {
																	setActiveIndex(i); // Set the active index
																	handleOptionSelection(option); // Handle the option selection
																}}
																style={{
																	textAlign: 'center',
																}}
															>
																<img
																	src={option.imageUrl ?? noImage}
																	alt={option.name}
																	className={`rounded-full shadow-md ${activeIndex === i
																		? 'border-[4px] border-black max-w-[55px] max-h-[55px] min-w-[55px] min-h-[55px]'
																		: 'max-w-[50px] max-h-[50px] min-w-[50px] min-h-[50px]'
																		}`}
																/>
																<div className="text-xs font-medium pt-1">
																	{option.name.slice(0, 6)}
																</div>
															</div>
														))}
													</div>

													{/* Next Button */}
													{showRightArrow && (
														<button
															onClick={() => handleNext(item)}
															className="z-10 mb-4 h-6 w-6 bg-slate-100 flex items-center justify-center rounded-full absolute right-2"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 1024 1024"
																width="40px"
																height="40px"
																fill="#000000"
															>
																<path d="M419.3 264.8l-61.8 61.8L542.9 512 357.5 697.4l61.8 61.8L666.5 512z" />
															</svg>
														</button>
													)}
												</div>
											}
										</div>

									);
								} else {
									return (
										<div key={item.templateGroupID}>
											<MenuItem
												selected={item.templateGroupID === selectedTemplateGroupId}
												onClick={() => handleTemplateGroupSelection(item.templateGroupID)}
												imageUrl={noImage}
												label={T._d(item.name)}
												isRound={false}
											>
												<ItemName>{T._d(item.name).toUpperCase()}</ItemName>
											</MenuItem>
										</div>
									);
								}
							})}

					</>
					{/* <MenuItem2
																	key={optionKey}
																	isRound={item.optionShapeType === 2}
																	description={option.description}
																	selected={isSelected}
																	imageUrl={option.imageUrl ?? noImage}
																	label={T._d(option.name)}
																	onClick={() => handleOptionSelection(option)}
																	hideLabel={item.optionShapeType === 2 ? item.hideOptionsLabel : true} /> */}

					{/* Color Variant */}
					{/* <MobileItemsContainer
						isLeftArrowVisible={true}
						isRightArrowVisible={true}
						scrollLeft={optionsScroll ?? 0}
						onScrollChange={(value) => setOptionsScroll(value)}
					>
						{lastSelectedItem?.type === 'attribute' ? (
							selectedAttribute && selectedAttribute.options.length > 0 && (
								selectedAttribute.options.map((option, index) =>
									option.enabled && (
										<MenuItem
											isRound={selectedAttribute.optionShapeType === 2}
											description={option.description}
											selected={option.selected}
											imageUrl={option.imageUrl ?? ''}
											label={T._d(option.name)}
											hideLabel={selectedAttribute.hideOptionsLabel}
											key={option.guid}
											onClick={() => handleOptionSelection(option)}
										/>
									)
								)
							)
						) : (
							selectedTemplateGroup &&
							isTemplateGroupOpened && (
								<TemplateGroup
									key={selectedTemplateGroupId}
									templateGroup={selectedTemplateGroup!}
									isMobile
									onCloseClick={() => {
										setIsTemplateGroupOpened(false);
										handleTemplateGroupSelection(null);
										handleGroupSelection(null);
									}}
								/>
							)
						)}
					</MobileItemsContainer> */}
				</>
			)}

			{/* Designer / Customizer */}
			{selectedGroup?.id === -2 && isTemplateEditorOpened && (
				<Designer
					onCloseClick={() => {
						setIsTemplateEditorOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}

			{/* Saved Compositions */}
			{draftCompositions && selectedGroup?.id === -3 && isDesignsDraftListOpened && (
				<DesignsDraftList
					onCloseClick={() => {
						setIsTemplateEditorOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}
		</MobileMenuContainer>
	);
};

export default MobileMenu;
