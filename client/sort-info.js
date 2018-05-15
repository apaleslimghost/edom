import React from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Session} from 'meteor/session';

import {Cards} from '../shared/collections';
import * as v from './visual';

const connectSortInfo = withTracker(() => ({
	selectedCard: Session.get('selectedCard') && Cards.findOne(Session.get('selectedCard')),
	removeSelected() {
		Session.set('selectedCard', null);
	}
}));

export default connectSortInfo(({selectedCard, removeSelected}) => <v.List>
	<span>
		Sorting by
		<strong> {selectedCard
			? <>links to <v.Tag>{selectedCard.title}</v.Tag></>
			: 'most-linked'
		}</strong>
	</span>
	{selectedCard && <v.Button onClick={removeSelected} color='grey' small>×</v.Button>}
</v.List>);
