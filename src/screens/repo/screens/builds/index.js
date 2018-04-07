import React, { Component } from "react";
import { Link } from "react-router-dom";
import { List, Item } from "./components";

import { fetchBuildList, compareBuild } from "shared/utils/build";
import { fetchRepository, repositorySlug } from "shared/utils/repository";

import { branch } from "baobab-react/higher-order";
import { inject } from "config/client/inject";

import styles from "./index.less";
import RepoMenu from "screens/repo/screens/builds/menu";

const binding = (props, context) => {
	const { owner, repo } = props.match.params;
	const slug = repositorySlug(owner, repo);
	return {
		repo: ["repos", "data", slug],
		builds: ["builds", "data", slug],
		loaded: ["builds", "loaded"],
		error: ["builds", "error"],
	};
};

@inject
@branch(binding)
export default class Main extends Component {
	componentWillMount() {
		this.synchronize(this.props);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			this.props.repo !== nextProps.repo ||
			this.props.builds !== nextProps.builds ||
			this.props.error !== nextProps.error ||
			this.props.loaded !== nextProps.loaded
		);
	}

	componentWillUpdate(nextProps) {
		if (this.props.match.url !== nextProps.match.url) {
			this.synchronize(nextProps);
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			window.scrollTo(0, 0);
		}
	}

	synchronize(props) {
		const { drone, dispatch, match, repo } = props;

		if (!repo) {
			dispatch(fetchRepository, drone, match.params.owner, match.params.repo);
		}

		dispatch(fetchBuildList, drone, match.params.owner, match.params.repo);
	}

	render() {
		const { repo, builds, loaded, error } = this.props;
		const list = Object.values(builds || {});

		function renderBuild(build) {
			return (
				<Link to={`/${repo.full_name}/${build.number}`} key={build.number}>
					<Item build={build} />
				</Link>
			);
		}

		if (error) {
			return <div>Not Found</div>;
		}

		if (!loaded && list.length === 0) {
			return <div>Loading</div>;
		}

		if (!repo) {
			return <div>Loading</div>;
		}

		if (list.length === 0) {
			return <div>Build list is empty</div>;
		}

		return (
			<div className={styles.root}>
				<List>{list.sort(compareBuild).map(renderBuild)}</List>
			</div>
		);
	}
}
