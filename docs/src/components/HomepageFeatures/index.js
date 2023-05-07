import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

// TODO: Add images
import simpleCodeImage from '../../../static/img/simple-code.png';
import autocompleteImage from '../../../static/img/autocomplete.png';
import datalistImage from '../../../static/img/datalist.png';

const FeatureList = [
  {
    title: 'Easy to Use',
    img: simpleCodeImage,
    description: (
      <>
        This package is very simple to use.
        <br />
        You don't need to find assets by id.
      </>
    ),
  },
  {
    title: 'Auto Complete Your Code',
    img: autocompleteImage,
    description: (
      <>
        Auto-completion will help you code in
        intelligent editors such as VSCode.
      </>
    )
  },
  {
    title: 'Get List of StarRail Objects',
    img: datalistImage,
    description: (
      <>
        You get a list of characters, light cones, etc. as well as player profiles!
        This includes detailed skill data and light cone capabilities.
      </>
    )
  }
];

function Feature({ img, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={img} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
