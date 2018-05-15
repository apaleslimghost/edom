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

export default connectSortInfo(({selectedCard, removeSelected}) => selectedCard ? <v.List>
	<span>Sorting by links to <strong>{selectedCard.title}</strong></span>
	<v.Button onClick={removeSelected} color='grey' small>×</v.Button>
</v.List> : null)
