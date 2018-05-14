import React from 'react';
import {render} from 'react-dom';
import {withTracker} from 'meteor/react-meteor-data';
import {Session} from 'meteor/session';
import styled, {injectGlobal, css} from 'styled-components';
import orderBy from 'lodash.orderby';
import formJson from '@quarterto/form-json';
import {Cards} from '../shared/collections';
import Markdown from 'react-markdown';
import {compose, withState, branch, renderComponent} from 'recompact';

const prevent = fn => ev => {
	ev.preventDefault();
	return fn(ev);
};

const getFormData = prevent(ev => {
	try {
		return formJson(ev.target);
	} finally {
		ev.target.reset();
	}
});

injectGlobal`
	body {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
		margin: 0;
	}

	* {
		box-sizing: border-box;
	}
`;


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


const withCardListActions = withTracker(() => {
	const selectedCard = Session.get('selectedCard');
	const cards = Cards.find().fetch();

	if (selectedCard) {
		const graph = buildGraph(cards);
		const d = distances(graph, selectedCard);

		cards.forEach(card => (card.sortedIndex = d[card._id]));
	}

	return {
		cards: orderBy(cards, ['sortedIndex', 'title']),
		addCard(card) {
			Cards.insert(card);
		}
	};
});

const box = css`
	border: 1px solid grey;
	border-radius: 2px;
`;

const Grid = styled.div`
	display: grid;
	padding: 1em;
	grid-gap: 1em;
	grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
`;

const Box = styled.div`
	${box}
	padding: 1em;
`;

const Tag = styled.span`
	background: ${({color}) => color || 'dodgerblue'};
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5);
	font-size: 0.8em;
	color: white;
	border-radius: 2px;
	padding: .25em;
`;

const Input = styled.input`
	${box}
	font: inherit;
	font-weight: normal;
	padding: .25em;
`;

const Textarea = Input.withComponent('textarea').extend`
	width: 100%;
	resize: vertical;
`;

const Label = styled.label`
	display: flex;
	align-items: center;
	font-weight: bold;
	margin-bottom: .5em;

	${Input} {
		flex: 1;
		margin-left: .5em;
	}
`;

const Button = Tag.withComponent('button').extend`
	border: 0 none;
	font-size: 1em;
	padding: .25em .5em;
`;

const Title = styled.h2`
	margin-top: 0;
`;

const Right = styled.span`
	float: right;
`;

const withRelated = withTracker(({related}) => ({
	relatedCards: Cards.find({
		_id: {$in: related || []}
	}).fetch(),
}));

const ShowCard = withRelated(({title, text = '', relatedCards, setEditing}) => <Box>
	<Right><Button onClick={() => setEditing(true)}>✎</Button></Right>
	<Title>{title}</Title>
	<Markdown source={text} />

	{relatedCards.map(card => <Tag key={card._id}>{card.title}</Tag>)}
</Box>);

const editCardAction = withTracker(({_id, setEditing}) => ({
	onSubmit(ev) {
		const data = getFormData(ev);

		if(_id) {
			Cards.update(_id, {$set: data});
		} else {
			Cards.insert(data);
		}

		setEditing && setEditing(false);
	},
}));

const EditCard = editCardAction(({title, text, onSubmit, setEditing}) => <Box>
	<form onSubmit={onSubmit}>
		<Label>Title <Input required name='title' defaultValue={title} /></Label>
		<Label><Textarea name='text' defaultValue={text} rows={5} /></Label>
		<Button>Save</Button>
		{setEditing && <Right><Button color='grey' onClick={prevent(() => setEditing(false))}>Cancel</Button></Right>}
	</form>
</Box>);

const Card = compose(
	withState('editing', 'setEditing', false),
	branch(
		({editing}) => editing,
		renderComponent(EditCard)
	)
)(ShowCard);

const CardList = withCardListActions(({cards, addCard}) => <Grid>
	{cards.map(card => <Card key={card._id} {...card} />)}

	<EditCard />
</Grid>);

Meteor.startup(() => {
	render(<CardList />, document.getElementById('root'));
});
