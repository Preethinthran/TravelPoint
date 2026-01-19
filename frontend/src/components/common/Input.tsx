import React from 'react';

interface InputProps {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const Input: React.FC<InputProps> = ({ label, type, value, onChange, placeholder}) =>{
    return(
        <div style={{ marginBottom: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px'}}>{label}</label>
            <input 
              type={type} 
              value={value} 
              onChange={onChange} 
              placeholder={placeholder} 
              style = {{padding:'10px', width:'100%', borderRadius: '5px', border: '1px solid #ccc'}}
            />
        </div>
    );
};

export default Input;