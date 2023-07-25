import React, { useState } from 'react';
import props from 'prop-types';
import './SliderButton.css';

const SliderButton = ({ onChange }) => {
  const [isChecked, setIsChecked] = useState(true);

  const handleToggle = () => {
    const newCheckedValue = !isChecked;
    setIsChecked(newCheckedValue);
    if (onChange) {
      onChange(newCheckedValue);
    }
  };

  return (
    <div className="slider-button">
      <input
        type="checkbox"
        id="toggle"
        className="slider-button__checkbox"
        checked={isChecked}
        onChange={handleToggle}
      />
      <label htmlFor="toggle" className="slider-button__label"></label>
    </div>
  );
};

export default SliderButton;

SliderButton.propTypes = {
    onChange: props.func,

};