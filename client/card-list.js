import React from 'react';
import {Session} from 'meteor/session';
import orderBy from 'lodash.orderby';
import {withTracker} from 'meteor/react-meteor-data';
import styled from 'styled-components';

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

	const linkedCards = cards.filter(c => typeof c.sortedIndex !== 'undefined');
	const unlinkedCards = cards.filter(c => typeof c.sortedIndex === 'undefined');

	const sortCards = cards => orderBy(
		cards,
		['sortedIndex', 'related.length', 'text.length', 'title'],
		['asc',         'desc',           'desc',        'asc']
	).filter(
		c => emptyFilter || c.tags.some(
			t => filterTags.has(t)
		)
	);

	return {
		cards: sortCards(unlinkedCards),
		linkedCards: sortCards(linkedCards),
		selectedCard,
	};
});

const Split = styled.hr`
	border: 0 none;
	border-top: 1px solid lightgrey;
`;

const CardList = connectCardList(({cards, linkedCards, selectedCard}) => <>
	{!!linkedCards.length && <v.Grid>
		<EditCard prelinked={selectedCard} />

		{linkedCards.map(card => <Card key={card._id} {...card} />)}
	</v.Grid>}
	{!!cards.length && <>
		{!!linkedCards.length && <Split />}
		<v.Grid>
			<EditCard />

			{cards.map(card => <Card key={card._id} {...card} />)}
		</v.Grid>
	</>}
</>);

export default CardList;
