import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import {
	ToolbarGroup,
	ToolbarButton,
	ToolbarDropdownMenu,
	PanelBody,
	TextControl,
	QueryControl,
	ToggleControl,
	QueryControls,
} from '@wordpress/components';
import { RawHTML } from '@wordpress/element';
// getSettings() returns undefined
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import {
	format,
	dateI18n,
	__experimentalGetSettings as getSettings,
} from '@wordpress/date';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const {
		numberOfPosts,
		displayFeaturedImage,
		selectedCategories,
		order,
		orderBy,
	} = attributes;

	const getLatestPosts = useSelect(
		(select) => {
			return select('core').getEntityRecords('postType', 'post', {
				per_page: numberOfPosts,
				_embed: true,
				order,
				orderby: orderBy,
				categories: Array.from(selectedCategories, (e) => e.id),
			});
		},
		[numberOfPosts, order, orderBy, selectedCategories]
	);

	const allCategories = useSelect(
		(select) => {
			return select('core').getEntityRecords('taxonomy', 'category', {
				per_page: -1,
			});
		},
		[numberOfPosts, order, orderBy]
	);

	const toggleDisplayedFeaturedImage = (value) => {
		setAttributes({ displayFeaturedImage: value });
	};

	const onNumberOfItemsChange = (value) => {
		setAttributes({ numberOfPosts: value });
	};

	const catSuggestions = {};

	if (allCategories) {
		for (const category of allCategories) {
			catSuggestions[category.name] = category;
		}
	}

	const onCategoryChange = (values) => {
		const hasNoSuggestions = values.some(
			(value) => typeof value === 'string' && !catSuggestions[value]
		);

		if (hasNoSuggestions) return;

		const updatedCategories = values.map((value) => {
			return typeof value === 'string' ? catSuggestions[value] : value;
		});

		/*	const updatedCategories = values.reduce((prev, curr) => {
			if(typeof curr === "string" && catSuggestions[curr]) {
				prev.push(catSuggestions[curr]);
			} else if(typeof curr == "object") {
				prev.push(curr)
			}
		}, [])
		*/

		setAttributes({
			selectedCategories: updatedCategories,
		});
	};

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__('Settings', 'text-domain')}
					initialOpen={true}
				>
					<ToggleControl
						label={__('Show featured image', 'text-domain')}
						checked={displayFeaturedImage}
						onChange={toggleDisplayedFeaturedImage}
					/>

					<QueryControls
						minItems="1"
						maxItems="5"
						numberOfItems={numberOfPosts}
						onNumberOfItemsChange={onNumberOfItemsChange}
						orderBy={orderBy}
						onOrderByChange={(value) => {
							setAttributes({ orderBy: value });
						}}
						order={order}
						onOrderChange={(value) => {
							setAttributes({ orderBy: value });
						}}
						// categoriesList={allCategories}
						// selectedCategoryId={
						// 	selectedCategory ? selectedCategory : false
						// }
						categorySuggestions={catSuggestions}
						selectedCategories={selectedCategories}
						onCategoryChange={onCategoryChange}
					></QueryControls>
				</PanelBody>
			</InspectorControls>

			<ul {...useBlockProps()}>
				{getLatestPosts &&
					getLatestPosts.map((post) => {
						const featuredImage =
							post._embedded &&
							post._embedded['wp:featuredmedia'] &&
							post._embedded['wp:featuredmedia'].length > 0 &&
							post._embedded['wp:featuredmedia'][0];

						return (
							<li key={post.id}>
								{displayFeaturedImage && featuredImage && (
									<img
										src={featuredImage.source_url}
										alt={featuredImage.alt_text}
									/>
								)}
								<h5>
									<a href="#">
										{post.title.rendered ? (
											<RawHTML>
												{post.title.rendered}
											</RawHTML>
										) : (
											__('No title', 'create-block')
										)}
									</a>
								</h5>
								{post.date_gmt && (
									<time dateTime={format('c', post.date_gmt)}>
										{dateI18n(
											getSettings().formats.date,
											post.date_gmt
										)}
									</time>
								)}
								{post.excerpt.rendered && (
									<RawHTML>{post.excerpt.rendered}</RawHTML>
								)}
							</li>
						);
					})}
			</ul>
		</>
	);
}
