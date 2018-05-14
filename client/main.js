import React from 'react';
import {render} from 'react-dom';
import {Session} from 'meteor/session';
import {injectGlobal} from 'styled-components';

import Tags from './tags';
import CardList from './card-list';

injectGlobal`
	body {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
		margin: 0;
	}

	* {
		box-sizing: border-box;
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
