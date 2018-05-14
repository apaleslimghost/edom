const prevent = fn => ev => {
	ev.preventDefault();
	return fn(ev);
};

export default prevent;
