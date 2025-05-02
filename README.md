# SparkBytes
By Yuri Bychkov, Ethan Liu, Mario Hysa, and Simran Singh 

SparkBytes is a web application dedicated to addressing two important challenges at Boston University: Food waste from over-purchasnig and community food access. SparkBytes aims to solve these by reducing food waste and help members of the BU community access free, delicious food!

Check out the website [here](https://681421597e29406dae061f0b--chic-griffin-d3de53.netlify.app/).

## Architecture Overview

Frontend 
- SparkBytes was bootstrapped and built with create-vite + React + Typescript. The front end used the Ant Design library for responsive UI components.
- We used Figma for UI wireframes and general visual design prototyping. 

Backend
- The backend used Firestore from Firebase to store event, user, and comment information and used Firebase Authentication to implement Google Sign-in, session tracking, and password recent functionality.
- We also utilized the Mapbox API for event geolocation and user travel time calculation. Check out the Mapbox documentation [here](https://docs.mapbox.com/api/overview/).

## React + TypeScript + Vite Framework Details

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
