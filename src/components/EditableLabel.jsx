import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './EditableLabel.css';

function EditableLabel({ label, value, onValueChange }) {
  const [isEditing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleLabelClick = () => {
    setEditing(true);
    if (label === "Password" && inputValue === "Reset Password") {
      setInputValue('');
    }
  }

  const handleInputBlur = () => {
    setEditing(false);
    if (!(label === "Password" && inputValue === '')) {
      onValueChange(inputValue);
    }
  }

  return (
    <div className='label'>
      <label>{label}</label>
      {isEditing ? (
        <input
          type={label === "Password" ? "password" : "text"}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          autoFocus
          maxLength={40}
        />
      ) : (
        <span className='user-input' onClick={handleLabelClick}>
          {inputValue || (label === "Password" ? 'Reset Password' : 'Click here to edit')}
        </span>
      )}
    </div>
  );
}

export default EditableLabel;

EditableLabel.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func
};
