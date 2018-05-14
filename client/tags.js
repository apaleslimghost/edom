import React from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Session} from 'meteor/session';

import * as v from './visual';
import {Cards} from '../shared/collections';

const connectTags = withTracker(() => {
	const filterTags = Session.get('filterTags') || [];
	const filterTagsSet = new Set(filterTags);
	const allTags = Array.from(
		Cards.find().fetch().reduce((allTags, {tags = []}) => {
			tags.forEach(tag => allTags.add(tag));
			return allTags;
		}, new Set)
	).sort((a, b) => a.localeCompare(b, 'en', {sensitivity: 'base'}));

	return {
		filterTags,
		allTags,
		unfilteredTags: allTags.filter(t => !filterTagsSet.has(t)),

		addToFilter(tag) {
			Session.set(
				'filterTags',
				 (Session.get('filterTags') || []).concat(tag),
			);
		},

		removeFromFilter(tag) {
			Session.set(
				'filterTags',
				(Session.get('filterTags') || []).filter(t => t !== tag)
			);
		},
	}
});

const Tags = connectTags(({filterTags, unfilteredTags, allTags, addToFilter, removeFromFilter}) => <v.Pad>
	{(!!filterTags.length || !!unfilteredTags.length) && <v.List>
		{!!filterTags.length && <strong>Filter:</strong>}
		<v.List>
			{filterTags.map(tag => <v.ColoredTag key={tag} onClick={() => removeFromFilter(tag)}>{tag}</v.ColoredTag>)}
		</v.List>
		{!!filterTags.length && !!unfilteredTags.length && <v.Sep />}
		<v.List>
			{unfilteredTags.map(tag => <v.ColoredTag onClick={() => addToFilter(tag)} key={tag}>{tag}</v.ColoredTag>)}
		</v.List>
	</v.List>}

	<datalist id='tags-list'>
		{allTags.map(tag => <option key={tag} value={tag} />)}
	</datalist>
</v.Pad>);

export default Tags;
