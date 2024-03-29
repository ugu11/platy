import React, { useEffect, useRef, useState } from 'react';
import { CardType } from '@models/Enums';
import '@styles/atoms/friend-status-button.scss';

interface Props {
    cardType: CardType;
    clickHandler?: () => void;
}

export const FriendStatusButton: React.FC<Props> = ({ cardType, clickHandler = () => {} }) => {
    const [buttonClass, setButtonClass] = useState('btn');
    const [buttonText, setButtonText] = useState('');
    const buttonData = {
        STRANGER: { btnClass: '', btnText: 'Add friend', hoveredText: 'Add friend' },
        FRIEND_REQUEST: {
            btnClass: 'btn-secondary',
            btnText: 'Friend request sent',
            hoveredText: 'Cancel friend request',
        },
        FRIEND: { btnClass: 'btn-secondary', btnText: 'Friends', hoveredText: 'Remove friend' },
    };

    const handleOnMouseEnter = () => {
        const { hoveredText } = buttonData[cardType];
        if (cardType === CardType.STRANGER) setButtonClass('');
        else setButtonClass('btn-secondary-red');

        setButtonText(hoveredText);
    };

    const handleOnMouseLeave = useRef(() => {});
    handleOnMouseLeave.current = () => {
        const { btnClass, btnText } = buttonData[cardType];
        setButtonClass(btnClass);
        setButtonText(btnText);
    };

    useEffect(() => {
        handleOnMouseLeave.current();
    }, []);

    return (
        <button
            className={'btn ' + buttonClass}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave.current}
            onClick={(e) => clickHandler()}
        >
            {buttonText}
        </button>
    );
};
