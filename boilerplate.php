<?php

/**
 * Plugin Name:       Dynamic News
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       dynamic-news
 *
 * @package           create-block
 */

function create_block_render_dynamic_news_block($args)
{
    $numberOfPosts = key_exists('numberOfPosts', $args) ? $args['numberOfPosts'] : 5;
    $displayFeaturedImage = key_exists('displayFeaturedImage', ) ? $args['displayFeaturedImage'] : true;
    $orderBy = key_exists('orderBy', $args) ? $args['orderBy'] : 'cdate';
    $order = key_exists('order', $args) ? $args['order'] : 'cdesc';

    $posts = get_posts([
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $numberOfPosts,
        'order' => $order,
        'orderby' => $orderBy
    ]);

    $posts_html = '';

    foreach ($posts as $post) {
        $title = get_the_title($post);
        $permalink = get_the_permalink($post);
        $excerpt = get_the_excerpt($post);

        $posts_html .= "<li>";

        if ($displayFeaturedImage && has_post_thumbnail($post)) {
            $posts_html .= '<a href="' . $permalink . '" title="' . esc_attr($title) . '">';
            $posts_html .= get_the_post_thumbnail($post, "post-thumbnail");
            $posts_html .= '</a>';
        }

        $posts_html .= "
        <h5><a href=\"$permalink\">" . (strlen($title) > 1 ? $title : __("No title", "create-block")) . "</a></h5>

		<time datetime=\"" . esc_attr(get_the_date("c", $post)) . "\">" .
            esc_html(get_the_date("", $post))
        . "</time>
		";

        if (!empty($excerpt)) {
            $posts_html .= "<p>$excerpt</p>";
        }

        $posts_html .= "
        </li>";
    }

    return sprintf('<ul %s>%s</ul>', get_block_wrapper_attributes(), $posts_html);
}

function create_block_dynamic_news_block_init()
{
    register_block_type(__DIR__ . '/build', array(
        'render_callback' => 'create_block_render_dynamic_news_block'
    ));
}
add_action('init', 'create_block_dynamic_news_block_init');