import React from 'react'
import PropTypes from 'prop-types';
import {format} from 'timeago.js';

export default function GiftSectionItem({gifts}) {
  return (
    <div>
        <div className="gift">
            {/* <Link to={`/profile/${user.username}`}> */}
            <img className='postProfileImg' src='/assets/person/no-profile-pic.webp' alt="" />
            {/* </Link> */}
            <div className="gift-details">
                <p className="gift-giver">Anonymous User</p>
                <p className="gift-item-title">{gifts.type === 'ItemGive' ? gifts.give.ebItemTitle : ''}</p>
                <p className="date">{format(gifts.createdAt)}</p>
            </div>
            <div className="gift-img-box">
          {gifts.type === 'ItemGive' ? (
            <img src={gifts.give.ebItemPhoto} alt="" />
          ) : (
            <div className="currency-amount-box">{`$${gifts.give.amount}`}</div>
          )}
            </div>

        </div>
    </div>
  )
}
GiftSectionItem.propTypes = {
    gifts: PropTypes.object.isRequired,

  };