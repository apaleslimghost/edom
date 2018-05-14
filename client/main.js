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
import stringHash from 'string-hash';

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

const box = css`
	border: 1px solid grey;
	border-radius: 2px;
`;

const Pad = styled.div`
	margin: 1em;
`;

const Grid = Pad.extend`
	display: grid;
	grid-gap: 1em;
	grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
`;

const Box = styled.div`
	${box}
	padding: 1em;
`;

const Tag = styled.button`
	cursor: pointer;
	border: 0 none;
	background: ${({color}) => color || 'dodgerblue'};
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5);
	font-size: 0.8em;
	color: white;
	border-radius: 2px;
	padding: .25em;
`;

const niceColors = [
	'dodgerblue',
	'mediumseagreen',
	'darkorange',
	'crimson',
	'darkorchid',
	'mediumvioletred',
	'tomato',
	'steelblue',
	'forestgreen',
];

const ColoredTag = ({children, ...props}) => <Tag {...props} color={niceColors[stringHash(children) % niceColors.length]}>{children}</Tag>

const Input = styled.input`
	${box}
	font: inherit;
	font-weight: normal;
	font-size: ${({small}) => small ? '0.8em' : 'inherit'};
	padding: .25em;
`;

const Textarea = Input.withComponent('textarea').extend`
	width: 100%;
	resize: vertical;
`;

const Select = Input.withComponent('select').extend`
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='10' height='5'%3E%3Cpath d='M 5,5 0,0 10,0 Z'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-size: 0.5em 0.25em;
	background-position: right 0.5em center;
	appearance: none;
	padding-right: 1.5em;

	&:invalid {
		color: rgba(0, 0, 0, 0.6);
	}
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

const Button = Tag.extend`
	box-shadow: inset 0 -.5px 0 .5px rgba(0, 0, 0, 0.5);
	font-size: 1em;
	padding: .25em .5em;

	&:hover {
		box-shadow: inset 0 -1px 0 .5px rgba(0, 0, 0, 0.5);
		filter: contrast(150%);
	}

	&:active {
		box-shadow: inset 0 0 0 .5px rgba(0, 0, 0, 0.5);
		filter: contrast(80%);
	}
`;

const Title = styled.h2`
	margin-top: 0;
`;

const Right = styled.span`
	float: right;
`;

const withRelated = withTracker(({_id, related}) => ({
	relatedCards: Cards.find({
		_id: {$in: related || []}
	}).fetch(),

	setSelected() {
		Session.set('selectedCard', _id);
	},

	removeRelated(related) {
		Cards.update(_id, {
			$pull: {related}
		})
	},

	addTag(ev) {
		const {tag} = getFormData(ev);
		Cards.update(_id, {
			$addToSet: {tags: tag}
		});
	},

	removeTag(tag) {
		Cards.update(_id, {
			$pull: {tags: tag}
		});
	}
}));

const withAllTags = withTracker(() => {
	const filterTags = Session.get('filterTags') || [];
	const filterTagsSet = new Set(filterTags);
	const allTags = Array.from(
		Cards.find().fetch().reduce((allTags, {tags = []}) => {
			tags.forEach(tag => allTags.add(tag));
			return allTags;
		}, new Set)
	);

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

const withAddRelated = withTracker(({card, exclude}) => ({
	cards: Cards.find({
		_id: {$nin: exclude}
	}).fetch(),

	addRelated(ev) {
		const related = ev.target.selectedOptions[0].value;
		Cards.update(card, {
			$addToSet: {related},
		});

		ev.target.selectedIndex = 0;
	}
}));

const List = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	margin-bottom: .25em;

	& > * {
		margin-bottom: .25em;
		margin-right: .25em;
	}
`

const AddRelated = withAddRelated(({cards = [], addRelated}) => cards.length ? <Select small defaultValue='' onChange={addRelated}>
	<option value='' disabled>Link...</option>
	{cards.map(
		card => <option value={card._id} key={card._id}>{card.title}</option>
	)}
</Select> : null);

const ShowCard = withRelated(({_id, title, text = '', related = [], relatedCards, tags = [], setEditing, setSelected, removeRelated, addTag, removeTag}) => <Box>
	<Right><Button onClick={() => setEditing(true)}>✎</Button></Right>
	<Title><a href={`#${_id}`} onClick={setSelected}>{title}</a></Title>
	<Markdown source={text} />

	<List>
		{tags.map(tag => <ColoredTag key={tag} onClick={() => removeTag(tag)}>{tag}</ColoredTag>)}
		<form onSubmit={addTag}>
			<Input placeholder='Tag...' size={7} name='tag' list='tags-list' small />
		</form>
	</List>

	<List>
		{relatedCards.map(card => <Tag key={card._id} onClick={() => removeRelated(card._id)}>{card.title}</Tag>)}
		<AddRelated card={_id} exclude={related.concat(_id)} />
	</List>
</Box>);

const editCardAction = withTracker(({_id, title, setEditing}) => ({
	onSubmit(ev) {
		const data = getFormData(ev);

		if(_id) {
			Cards.update(_id, {$set: data});
		} else {
			data.tags = Session.get('filterTags') || [];
			Cards.insert(data);
		}

		setEditing && setEditing(false);
	},

	deleteCard() {
		if(confirm(`Delete "${title}"?`)) {
			Cards.remove(_id);
			Cards.find({related: _id}).forEach(card => {
				Cards.update(card._id, {
					$pull: {related: _id},
				});
			});
		}
	}
}));

const EditCard = editCardAction(({_id, deleteCard, title, text, onSubmit, setEditing}) => <Box>
	<form onSubmit={onSubmit}>
		<Label>Title <Input required name='title' defaultValue={title} /></Label>
		<Label><Textarea name='text' defaultValue={text} rows={5} /></Label>

		{_id && <Right><Button color='crimson' onClick={prevent(deleteCard)}>Delete</Button></Right>}
		<List>
			<Button>Save</Button>
			{setEditing && <Button color='grey' onClick={prevent(() => setEditing(false))}>Cancel</Button>}
		</List>
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

const AllTags = withAllTags(({filterTags, unfilteredTags, allTags, addToFilter, removeFromFilter}) => <Pad>
	{(!!filterTags.length || !!unfilteredTags.length) && <List>
		{!!filterTags.length && <strong>Filter:</strong>}
		<List>
			{filterTags.map(tag => <ColoredTag key={tag} onClick={() => removeFromFilter(tag)}>{tag}</ColoredTag>)}
		</List>
		{!!filterTags.length && !!unfilteredTags.length && <span>│</span>}
		<List>
			{unfilteredTags.map(tag => <ColoredTag onClick={() => addToFilter(tag)} key={tag}>{tag}</ColoredTag>)}
		</List>
	</List>}

	<datalist id='tags-list'>
		{allTags.map(tag => <option key={tag} value={tag} />)}
	</datalist>
</Pad>);

const App = () => <main>
	<AllTags />
	<CardList />
</main>;

Meteor.startup(() => {
	if(location.hash) {
		Session.set('selectedCard', location.hash.slice(1));
	}

	render(<App />, document.getElementById('root'));
});
