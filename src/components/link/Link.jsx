import React from 'react';
import PropTypes from "prop-types";
import {format} from 'timeago.js';
import './Link.css';

function Link({link}) {
    let giveorreceive;

    if (link.details.giveorreceive === "give"){
        giveorreceive = "giving"
    } else {
        giveorreceive = "requesting"
    }

  return (
    <div className='link-container'>
        <div className="link-content-container">
            <div className="left-side">
                <div className="link-item-container">
                    {link.details.photo &&
                        <img src={link.details.photo} alt="" />
                    }
                    {!link.details.photo && 
                        <div className="amount-container">
                            <h4 className='amount-headline'>${link.details.amount}</h4>
                        </div>
                    }
                </div>
            </div>
            <div className="right-side">
                <p className='description'>User near Los Angeles, CA is {giveorreceive} {link.details.title}</p>
                <p className="created-at">{format(link.updatedAt)}</p>
            </div>
        </div>
        <div className="line-break-container">
            <span className="line-break-link"/>
        </div>
    </div>
  )
}


Link.propTypes = {
    link: PropTypes.shape({
        details: PropTypes.shape({
            title: PropTypes.string,
            photo: PropTypes.string,
            amount: PropTypes.number,
            giveorreceive: PropTypes.string
        }),
        updatedAt: PropTypes.string
    }),
};

export default Link;
