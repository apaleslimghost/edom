import React from 'react';
import styled, {css} from 'styled-components';
import stringHash from 'string-hash';

const box = css`
	border: 1px solid grey;
	border-radius: 2px;
`;

export const Pad = styled.div`
	margin: 1em;
`;

export const Grid = Pad.extend`
	display: grid;
	grid-gap: 1em;
	grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
`;

export const Box = styled.div`
	${box}
	padding: 1em;
`;

export const Tag = styled.button`
	cursor: pointer;
	border: 0 none;
	background: ${({color}) => color || 'dodgerblue'};
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5);
	font-size: 0.8em;
	color: white;
	border-radius: 2px;
	padding: .25em;
`;

export const niceColors = [
	'darkcyan',
	'mediumseagreen',
	'darkorange',
	'crimson',
	'darkorchid',
	'mediumvioletred',
	'tomato',
	'steelblue',
	'forestgreen',
	'goldenrod',
	'indianred',
	'yellowgreen'
];

export const ColoredTag = ({children, ...props}) => <Tag {...props} color={niceColors[stringHash(children) % niceColors.length]}>{children}</Tag>

export const Input = styled.input`
	${box}
	font: inherit;
	font-weight: normal;
	font-size: ${({small}) => small ? '0.8em' : 'inherit'};
	padding: .25em;
`;

export const Textarea = Input.withComponent('textarea').extend`
	width: 100%;
	resize: vertical;
`;

export const Select = Input.withComponent('select').extend`
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

export const Label = styled.label`
	display: flex;
	align-items: center;
	font-weight: bold;
	margin-bottom: .5em;

	${Input} {
		flex: 1;
		margin-left: .5em;
	}
`;

export const Button = Tag.extend`
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

export const Title = styled.h2`
	margin-top: 0;
`;
export const List = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-bottom: .25em;

	& > * {
		margin-bottom: .25em;
		margin-right: .25em;
	}

	& > & {
		margin-right: 0;
		margin-bottom: 0;
	}
`;

export const Right = List.extend`
	margin-left: auto;
	margin-right: 0;
	margin-bottom: 0;

	& > * {
		margin-left: .25em;
		margin-right: 0;
	}
`;


export const Sep = styled.span`
	display: inline-block;
	vertical-align: middle;
	height: 2em;
	width: 1px;
	background: lightgrey;
	margin: -.25em .25em 0;

	${List} > & {
		margin-right: .5em;
	}
`
