import React from 'react';
import Markdown from 'react-markdown';
import {withTracker} from 'meteor/react-meteor-data';
import {compose, withState, branch, renderComponent} from 'recompact';
import styled from 'styled-components';

import * as v from './visual';
import prevent from './prevents-default';
import getFormData from './form-data';
import {Cards} from '../shared/collections';
import slug from './slug';
import CardSelect from './select-card';

const connectCard = withTracker(({_id, title, related}) => {
	const relatedCards = Cards.find({
		_id: {$in: related || []}
	}).fetch();

	return {
		relatedCards,

		setSelected() {
			if(Session.get('selectedCard') === _id) {
				Session.set('selectedCard', null);
			} else {
				Session.set('selectedCard', _id);
			}
		},

		removeRelated(related) {
			const relatedCard = relatedCards.find(({_id}) => _id === related);
			
			if(config(`Unlink ${title} and ${relatedCard.title}?`)) {
				Cards.update(_id, {
					$pull: {related},
				});

				Cards.update(related, {
					$pull: {related: _id},
				});
			}
		},

		addTag(ev) {
			const {tag} = getFormData(ev);
			Cards.update(_id, {
				$addToSet: {tags: tag}
			});
		},

		removeTag(tag) {
			confirm(`Remove tag ${tag} from ${title}?`) && Cards.update(_id, {
				$pull: {tags: tag}
			});
		},

		isSelected: Session.get('selectedCard') === _id,
	};
});

const connectAddRelated = withTracker(({card}) => ({
	addRelated(related) {
		Cards.update(card, {
			$addToSet: {related},
		});

		Cards.update(related, {
			$addToSet: {related: card},
		});
	}
}));


const AddRelated = connectAddRelated(({addRelated, exclude}) =>
	<CardSelect size={7} onSelect={addRelated} exclude={exclude} placeholder='Link...' small />
);

const Vertical = v.Box.extend`
	position: relative;
	display: flex;
	flex-direction: column;
`;

const Bottom = styled.div`
	margin-top: auto;
	padding-top: 1em;
	border-top: 1px solid lightgrey;
`;

const Floating = styled.div`
	position: absolute;
	top: 1em;
	right: 1em;
`;

const TitleLink = styled.a`
	&, &:link, &:visited {
		color: inherit;
		text-decoration: none;
	}

	&:hover {
		color: dodgerblue;
		text-decoration: underline;
		text-decoration-skip: ink;
	}

	&:active {
		color: cornflowerblue;
	}
`;

const MD = styled(Markdown)`
img {
	max-width: 100%;
	height: auto;
}
`;

const ShowCard = connectCard(({
	_id,
	title,
	text = '',
	related = [],
	relatedCards,
	tags = [],
	setEditing,
	setSelected,
	removeRelated,
	addTag,
	removeTag,
	isSelected,
	sortedIndex,
}) => <Vertical>
	<Floating><v.Button onClick={() => setEditing(true)}>✎</v.Button></Floating>
	<v.Title bold={isSelected}>
		<v.List>
			{!!sortedIndex && <v.Tag color='grey' small>{sortedIndex}</v.Tag>}
			<TitleLink href={`#${isSelected ? '' : _id}`} onClick={setSelected}>{title}</TitleLink>
		</v.List>
	</v.Title>
	<MD source={text} />

	<Bottom>
		<v.List>
			{tags.map(tag => <v.ColoredTag key={tag} onClick={() => removeTag(tag)}>{tag}</v.ColoredTag>)}
			<form onSubmit={addTag}>
				<v.Input placeholder='Tag...' size={7} name='tag' list='tags-list' small />
			</form>
			<v.Sep />
			{relatedCards.map(card => <v.Tag key={card._id} onClick={() => removeRelated(card._id)}>{card.title}</v.Tag>)}
			<AddRelated card={_id} exclude={related.concat(_id)} />
		</v.List>
	</Bottom>
</Vertical>);

const editCardAction = withTracker(({_id, title, setEditing, prelinked}) => ({
	prelinkedCard: Cards.findOne(prelinked),
	pretag: Session.get('filterTags') || [],

	onSubmit(ev) {
		const data = getFormData(ev);

		if(_id) {
			Cards.update(_id, {$set: data});
		} else {
			data._id = slug(data.title);

			const addPrelink = prelinked && data._link;

			data.related = [];
			if(addPrelink) {
				data.related = prelinked ? [prelinked] : [];
			}

			data.tags = [];
			if(data._tag) {
				data.tags = Session.get('filterTags') || [];
			}

			delete data._link;
			delete data._tag;

			Cards.insert(data, (err, _id) => {
				if(addPrelink && !err) {
					Cards.update(prelinked, {
						$addToSet: {
							related: _id,
						},
					});
				}
			});
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

const FlexForm = styled.form`
	height: 100%;
	display: flex;
	flex-direction: column;
`;

const FlexLabel = v.Label.extend`
	display: flex;
	flex-direction: column;
	flex: 1;

	${v.Textarea} {
		flex: 1;
	}
`;

export const EditCard = editCardAction(({
	_id,
	deleteCard,
	title,
	text,
	onSubmit,
	setEditing,
	prelinkedCard,
	pretag,
}) => <v.Box>
	<FlexForm onSubmit={onSubmit}>
		<v.Label><v.Input required name='title' defaultValue={title} large placeholder='Title' /></v.Label>
		<FlexLabel><v.Textarea name='text' defaultValue={text} rows={5} placeholder='Description' /></FlexLabel>

		<v.List>
			{prelinkedCard && <v.Label>
				<span>Link to</span>
				<v.Tag>{prelinkedCard.title}</v.Tag>
				<input type='checkbox' name='_link' defaultChecked />
			</v.Label>}

			{!_id && !!pretag.length && <v.Label>
				<span>Tag with</span>
				{pretag.map(tag => <v.ColoredTag key={tag}>{tag}</v.ColoredTag>)}
				<input type='checkbox' name='_tag' defaultChecked />
			</v.Label>}

			{_id && <v.Button color='crimson' onClick={prevent(deleteCard)}>Delete</v.Button>}

			<v.Right>
				{setEditing && <v.Button color='grey' onClick={prevent(() => setEditing(false))}>Cancel</v.Button>}
				<v.Button color={!_id ? 'mediumseagreen' : undefined}>{_id ? 'Save' : 'Add'}</v.Button>
			</v.Right>
		</v.List>
	</FlexForm>
</v.Box>);

export const Card = compose(
	withState('editing', 'setEditing', false),
	branch(
		({editing}) => editing,
		renderComponent(EditCard)
	)
)(ShowCard);
