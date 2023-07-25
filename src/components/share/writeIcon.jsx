import React from 'react';
import { Link } from 'react-router-dom';
import { AiFillPlusCircle } from 'react-icons/ai';
import './writeIcon.css';

export default function WriteIcon() {
  return (
    <div className='iconContainer'>
      <Link to={`/share`}>
        <AiFillPlusCircle className='addIcon' />
      </Link>
    </div>
  )
}
