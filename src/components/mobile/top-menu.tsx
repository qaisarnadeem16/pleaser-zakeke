// Import necessary dependencies
import { Icon } from 'components/Atomic';
import Tooltip from 'components/widgets/tooltip';
import React, { FC, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { ReactComponent as ArrowLeftIcon } from '../../assets/icons/arrow-left-solid.svg';
import { ReactComponent as ArrowRightIcon } from '../../assets/icons/arrow-right-solid.svg';
import noImage from '../../assets/images/no_image.png';

// Styled component for the container of each mobile menu item
export const MobileItemContainer = styled.div<{ selected?: boolean }>`
	align-items: center;
	justify-content: center;
	min-width: 140px;
	max-width: 40px;
	width: 140px;
	height: 140px;
	min-height: 140px;
	max-height: 140px;
	flex: 1;
	display: flex;
	flex-direction: column;
	border-right: 2px #fff solid;
	position: relative;
	${(props) => props.selected && `background-color: red;`}
`;

// Styled component for the image of each menu item
export const MenuItemImage = styled.img<{ isRound?: boolean }>`
	width: 64px;
	height: 64px;
	object-fit: ${(props) => (props.isRound ? 'cover' : 'contain')};
	margin-bottom: 20px;
	border-radius: ${(props) => (props.isRound ? '64px!important' : '0')};
`;

// Styled component for the wrapper of multiple images in a menu item
export const MenuItemImagesWrapper = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	position: relative;
	top: -10px;
`;

// Styled component for each image wrapper in the menu item
export const MenuItemImagesImageWrapper = styled.div`
	width: 35px;
	height: 35px;
	&:nth-child(1) {
		border-right: 1px #ddd dotted;
		border-bottom: 1px #ddd dotted;
	}

	&:nth-child(2) {
		border-bottom: 1px #ddd dotted;
	}

	&:nth-child(3) {
		border-right: 1px #ddd dotted;
	}
`;

// Styled component for the label of each menu item
export const MenuItemLabel = styled.span`
	font-size: 14px;
	font-weight: 500;
	position: absolute;
	bottom: 20px;
	left: 0;
	right: 0;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

// Styled component for each image in the menu item
export const MenuItemImagesImage = styled.img<{ isRound?: boolean }>`
	width: 100%;
	height: 100%;
	object-fit: cover;
	padding: 3px;
	border-radius: ${(props) => (props.isRound ? '64px!important' : '0')};
`;

// Styled component for the icon of each menu item
export const MenuItemIcon = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40px;
	margin-bottom: 20px;
	width: 64px;
	height: 64px;
`;

// Function to determine the visibility of left and right arrows based on scroll position
const getVisibleArrows = (div: HTMLDivElement) => {
    let showLeft = false;
    let showRight = false;

    if (div.scrollLeft > 0) showLeft = true;

    if (div.scrollWidth - div.clientWidth > div.scrollLeft) showRight = true;

    return [showLeft, showRight];
};

// Props for the container of menu items
interface MenuItemsContainerProps {
    isLeftArrowVisible: boolean;
    isRightArrowVisible: boolean;
    onScrollChange: (value: number) => void;
    scrollLeft: number;
    children?: React.ReactNode;
}

// Props for each menu item
interface MenuItemProps {
    selected?: boolean;
    imageUrl?: string | null;
    icon?: React.ReactNode | string | null | undefined;
    label: string;
    onClick: () => void;
    className?: string;
    images?: string[];
    hideLabel?: boolean;
    description?: string | null;
    isRound?: boolean;
    children?: React.ReactNode;
}

// Styled component for the wrapper of menu items
const MenuItemsWrapper = styled.div`
	display: flex;
	max-width: 100%;
	min-height: 141px;
	width: 100%;
	overflow-x: auto;
	background-color: #ffffff;
	border-top: 1px #ffffff solid;
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */

	::-webkit-scrollbar {
		display: none;
	}

	span {
		font-size: 16px;
	}
`;

// Styled component for the left arrow
const ArrowCss = css`
	position: absolute;
	left: 10px;
	bottom: 60px;
	background-color: #f1f1f1;
	border-radius: 30px;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 3;
`;

// Styled component for the left arrow
const ArrowLeft = styled.div`
	${ArrowCss};
`;

// Styled component for the right arrow
const ArrowRight = styled.div`
	${ArrowCss};
	left: auto;
	right: 10px;
`;

// Styled component for the left arrow icon
const ArrowLeftIconStyled = styled(Icon)`
	font-size: 22px;
`;

// Styled component for the right arrow icon
const ArrowRightIconStyled = styled(Icon)`
	font-size: 22px;
`;

// Container component for mobile menu items
export const MobileItemsContainer2: FC<MenuItemsContainerProps & { groups: any[]; setSelectedGroup: (group: any) => void; selectedGroup: any }> = ({
    children,
    isLeftArrowVisible,
    isRightArrowVisible,
    onScrollChange,
    scrollLeft,
    groups,
    setSelectedGroup,
    selectedGroup,
}) => {
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    if (ref.current && scrollLeft != null) ref.current.scrollLeft = scrollLeft ?? 0;

    // Find the current index of the selected group
    const currentIndex = groups.findIndex((group) => group === selectedGroup);

    const handleLeftArrowClick = () => {
        if (currentIndex > 0) {
            setSelectedGroup(groups[currentIndex - 1]);
        }
    };

    const handleRightArrowClick = () => {
        if (currentIndex < groups.length - 1) {
            setSelectedGroup(groups[currentIndex + 1]);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                onScrollChange(ref.current.scrollLeft);
                const [showLeft, showRight] = getVisibleArrows(ref.current);
                setShowLeftArrow(showLeft);
                setShowRightArrow(showRight);
            }
        };

        handleScroll();

        const actualRef = ref.current;
        actualRef?.addEventListener('scroll', handleScroll);
        return () => actualRef?.removeEventListener('scroll', handleScroll);
    }, [onScrollChange]);

    return (
        <MenuItemsWrapper ref={ref}>
            {showLeftArrow && isLeftArrowVisible && (
                <ArrowLeft onClick={handleLeftArrowClick}>
                    <ArrowLeftIconStyled>
                        <ArrowLeftIcon />
                    </ArrowLeftIconStyled>
                </ArrowLeft>
            )}

            {/* Content */}
            {children}

            {showRightArrow && isRightArrowVisible && (
                <ArrowRight onClick={handleRightArrowClick}>
                    <ArrowRightIconStyled>
                        <ArrowRightIcon />
                    </ArrowRightIconStyled>
                </ArrowRight>
            )}
        </MenuItemsWrapper>
    );
};
// Component for each menu item
export const MenuItem2: FC<MenuItemProps> = (props) => {
    return (
        <MobileItemContainer onClick={props.onClick} selected={props.selected}>

            {!props.hideLabel && <MenuItemLabel>{props.label}</MenuItemLabel>}
        </MobileItemContainer>
    );
};
