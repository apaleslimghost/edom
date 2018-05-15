import React from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import shortId from '@quarterto/short-id';

import * as v from './visual';
import {Cards} from '../shared/collections';

const connectCardSearch = withTracker(({exclude = [], onSelect}) => {
	const id = shortId();

	return {
		id,

		cards: Cards.find({
			_id: {$nin: exclude}
		}, {
			sort: {
				title: 1
			}
		}).fetch(),

		onChange(ev) {
			const datalist = document.getElementById(id);
			const option = Array.from(datalist.options).find(
				o => o.dataset.title === ev.target.value,
			);

			if(option) {
				onSelect(option.dataset.value);
				ev.target.value = '';
			}
		},
	};
});

const CardSelect = connectCardSearch(({id, cards, onChange, exclude, onSelect, ...props}) => <>
	<datalist id={id}>
		{cards.map(
			card => <option key={card._id} data-value={card._id} data-title={card.title}>{card.title}</option>
		)}
	</datalist>

	<v.Input list={id} defaultValue='' onChange={onChange} {...props} />
</>);

export default CardSelect;
