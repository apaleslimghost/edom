import React from 'react';
import {Session} from 'meteor/session';
import orderBy from 'lodash.orderby';
import {withTracker} from 'meteor/react-meteor-data';

import * as v from './visual';
import {Cards} from '../shared/collections';
import {Card, EditCard} from './card';

const distances = (graph, start, visited = {[start]: 0}, depth = 1) => {
	const next = graph[start];
	const nextDepth = depth + 1;

	next &&
		next
			.filter(node => {
				if (node in visited) return false;
				visited[node] = depth;
				return true;
			})
			.forEach(node => {
				distances(graph, node, visited, nextDepth);
			});

	return visited;
};

const buildGraph = cards =>
	cards.reduce(
		(graph, card) => Object.assign(graph, {[card._id]: card.related}),
		{}
	);

const connectCardList = withTracker(() => {
	const selectedCard = Session.get('selectedCard');
	const cards = Cards.find().fetch();
	const filterTags = new Set(Session.get('filterTags') || []);
	const emptyFilter = filterTags.size === 0;

	if(selectedCard) {
		const graph = buildGraph(cards);
		const d = distances(graph, selectedCard);

		cards.forEach(card => {
			card.sortedIndex = d[card._id]
		});
	}

	return {
		cards: orderBy(cards, ['sortedIndex', 'text.length', 'title'], ['asc', 'desc', 'asc']).filter(c => emptyFilter || c.tags.some(t => filterTags.has(t))),
		addCard(card) {
			Cards.insert(card);
		}
	};
});

const CardList = connectCardList(({cards, addCard}) => <v.Grid>
	{cards.map(card => <Card key={card._id} {...card} />)}

	<EditCard />
</v.Grid>);

export default CardList;
