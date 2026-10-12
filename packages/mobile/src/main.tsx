import { render } from 'preact';
import { defineCustomElements } from '@ionic/core/loader';
import './styles/index.css';
import App from './app';

defineCustomElements(window);
render(<App />, document.getElementById('app')!);
