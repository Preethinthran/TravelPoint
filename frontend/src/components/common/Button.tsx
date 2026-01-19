import React from 'react';

interface ButtonProps {
    text: string;
    onClick?: ()=> void;
    type?: "button"|"submit"|"reset";
    disabled?: boolean;
    variant?: "primary"|"secondary";
}

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false
}) => {
    return (
        <button
            type = {type}
            className={`btn btn-${variant}`}
            onClick ={onClick}
            disabled = {disabled}
            >
                {text}
            </button>
    )
};

export default Button;
