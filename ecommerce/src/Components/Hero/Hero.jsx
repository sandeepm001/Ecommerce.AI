import React from 'react';
import './Hero.css';
import { useNavigate } from 'react-router-dom';

import menBanner from '../Assets/Frontend_Assets/banner_mens.png';
import womenBanner from '../Assets/Frontend_Assets/banner_women.png';
import kidsBanner from '../Assets/Frontend_Assets/banner_kid.png';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-slider-wrapper">
      <div className="hero-slider">
        <div className="slide" onClick={() => navigate('/men')}>
          <img src={menBanner} alt="Men" />
          <div className="slide-copy">
            <p>Fresh arrivals</p>
            <h1>Shop the new season</h1>
            <button>Explore men</button>
          </div>
        </div>
        <div className="slide" onClick={() => navigate('/women')}>
          <img src={womenBanner} alt="Women" />
          <div className="slide-copy">
            <p>Curated looks</p>
            <h1>Everyday styles, upgraded</h1>
            <button>Explore women</button>
          </div>
        </div>
        <div className="slide" onClick={() => navigate('/kids')}>
          <img src={kidsBanner} alt="Kids" />
          <div className="slide-copy">
            <p>Comfort first</p>
            <h1>Play-ready kidswear</h1>
            <button>Explore kids</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
