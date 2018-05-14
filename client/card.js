import React from 'react';
import Markdown from 'react-markdown';
import {withTracker} from 'meteor/react-meteor-data';
import {compose, withState, branch, renderComponent} from 'recompact';

import * as v from './visual';
import prevent from './prevents-default';
import getFormData from './form-data';
import {Cards} from '../shared/collections';

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

const connectAddRelated = withTracker(({card, exclude}) => ({
	cards: Cards.find({
		_id: {$nin: exclude}
	}, {
		sort: {
			title: 1
		}
	}).fetch(),

	addRelated(ev) {
		const related = ev.target.selectedOptions[0].value;

		Cards.update(card, {
			$addToSet: {related},
		});

		ev.target.selectedIndex = 0;
	}
}));

const AddRelated = connectAddRelated(({cards = [], addRelated}) => cards.length ? <v.Select small defaultValue='' onChange={addRelated}>
	<option value='' disabled>Link...</option>
	{cards.map(
		card => <option value={card._id} key={card._id}>{card.title}</option>
	)}
</v.Select> : null);

const ShowCard = withRelated(({_id, title, text = '', related = [], relatedCards, tags = [], setEditing, setSelected, removeRelated, addTag, removeTag}) => <v.Box>
	<v.Right><v.Button onClick={() => setEditing(true)}>✎</v.Button></v.Right>
	<v.Title><a href={`#${_id}`} onClick={setSelected}>{title}</a></v.Title>
	<Markdown source={text} />

	<v.List>
		{tags.map(tag => <v.ColoredTag key={tag} onClick={() => removeTag(tag)}>{tag}</v.ColoredTag>)}
		<form onSubmit={addTag}>
			<v.Input placeholder='Tag...' size={7} name='tag' list='tags-list' small />
		</form>
	</v.List>

	<v.List>
		{relatedCards.map(card => <v.Tag key={card._id} onClick={() => removeRelated(card._id)}>{card.title}</v.Tag>)}
		<AddRelated card={_id} exclude={related.concat(_id)} />
	</v.List>
</v.Box>);


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

export const EditCard = editCardAction(({_id, deleteCard, title, text, onSubmit, setEditing}) => <v.Box>
	<form onSubmit={onSubmit}>
		<v.Label>Title <v.Input required name='title' defaultValue={title} /></v.Label>
		<v.Label><v.Textarea name='text' defaultValue={text} rows={5} /></v.Label>

		{_id && <v.Right><v.Button color='crimson' onClick={prevent(deleteCard)}>Delete</v.Button></v.Right>}
		<v.List>
			<v.Button>Save</v.Button>
			{setEditing && <v.Button color='grey' onClick={prevent(() => setEditing(false))}>Cancel</v.Button>}
		</v.List>
	</form>
</v.Box>);

export const Card = compose(
	withState('editing', 'setEditing', false),
	branch(
		({editing}) => editing,
		renderComponent(EditCard)
	)
)(ShowCard);
