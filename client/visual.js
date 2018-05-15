import React from 'react';
import styled, {css} from 'styled-components';
import stringHash from 'string-hash';

const box = css`
	border: 1px solid grey;
	border-radius: 2px;
`;

export const Pad = styled.div`
	margin: 1rem;
`;

export const Grid = Pad.extend`
	display: grid;
	grid-gap: 1rem;
	grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
`;

export const Box = styled.div`
	${box}
	padding: 1rem;
`;

const _Tag = styled.span`
	display: inline-block;
	font: inherit;
	font-weight: normal;
	border: 0 none;
	background: ${({color}) => color || 'dodgerblue'};
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5);
	font-size: 0.8rem;
	color: white;
	border-radius: 2px;
	padding: .25rem;
`;

const _ButtonTag = _Tag.withComponent('button').extend`
	cursor: pointer;
`;

export const Tag = props => props.onClick ? <_ButtonTag {...props} /> : <_Tag {...props} />

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
	font-size: ${({small}) => small ? '0.8rem' : 'inherit'};
	padding: .25rem;
`;

export const Textarea = Input.withComponent('textarea').extend`
	width: 100%;
	resize: vertical;
`;

export const Select = Input.withComponent('select').extend`
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='10' height='5'%3E%3Cpath d='M 5,5 0,0 10,0 Z'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-size: 0.5rem 0.25rem;
	background-position: right 0.5rem center;
	appearance: none;
	padding-right: 1.5rem;

	&:invalid {
		color: rgba(0, 0, 0, 0.6);
	}
`;

export const Button = _ButtonTag.extend`
	font-size: ${({small}) => small ? '0.8rem' : '1rem'};
	box-shadow: inset 0 -.5px 0 .5px rgba(0, 0, 0, 0.5);
	padding: .25rem .5rem;

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
	font-weight: ${({bold}) => bold ? 'bold' : 'normal'};
`;

export const List = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-bottom: .25rem;

	& > * {
		margin-bottom: .25rem;
		margin-right: .25rem;
	}

	& > & {
		margin-right: 0;
		margin-bottom: 0;
	}
`;

export const Label = List.withComponent('label').extend`
	display: flex;
	align-items: center;
	margin-bottom: .5rem;

	${Input} {
		flex: 1;
		margin-left: .5rem;
	}
`;


export const Right = List.extend`
	margin-left: auto;
	margin-right: 0;
	margin-bottom: 0;

	& > * {
		margin-left: .25rem;
		margin-right: 0;
	}
`;


export const Sep = styled.span`
	display: inline-block;
	vertical-align: middle;
	height: 2rem;
	width: 1px;
	background: lightgrey;
	margin: -.25rem .25rem 0;

	${List} > & {
		margin-right: .5rem;
	}
`
