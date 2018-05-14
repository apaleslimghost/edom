import React from 'react';
import {render} from 'react-dom';
import {Session} from 'meteor/session';
import {injectGlobal} from 'styled-components';

import Tags from './tags';
import CardList from './card-list';

injectGlobal`
	body {
		font-family: "American Typewriter", "Courier New", monospace;
		margin: 0;
	}

	* {
		box-sizing: border-box;
	}

	h1, h2, h3, h4, h5, h6 {
		font-weight: normal;
	}
`;

const App = () => <main>
	<Tags />
	<CardList />
</main>;

Meteor.startup(() => {
	if(location.hash) {
		Session.set('selectedCard', location.hash.slice(1));
	}

	render(<App />, document.getElementById('root'));
});
