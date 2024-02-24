import React from 'react';
import PropTypes from "prop-types";
import {format} from 'timeago.js';
import './Link.css';
import { useNavigate } from 'react-router';

function Link({link}) {
    let giveOrReceive;
    let titleOrAmount;
    let giveAmount;
    const navigate = useNavigate();

    if (link.details.giveorreceive === "give"){
        giveOrReceive = "giving"
    } else {
        giveOrReceive = "requesting"
    }

    if(link.details.type === "currency"){
        if(link.details.amount > 1.99){
            giveAmount = link.details.amount;
            titleOrAmount = `${giveAmount} dollars.`;

        } else {
            giveAmount = link.details.amount;
            titleOrAmount = `${giveAmount} dollar.`;
        }
    } else{
        titleOrAmount = `${link.details.title}.`;
    }

    const goToLink = () => {
        navigate(`/link/${link.link}`)
    }

  return (
    <div className='link-container' onClick={goToLink}>
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
                <p className='description'>User is {giveOrReceive} {titleOrAmount}</p>
                <p className="created-at">{format(link.createdAt)}</p>
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
            giveorreceive: PropTypes.string,
            type: PropTypes.string
            
        }),
        link: PropTypes.string,
        createdAt: PropTypes.string
    }),
};

export default Link;
