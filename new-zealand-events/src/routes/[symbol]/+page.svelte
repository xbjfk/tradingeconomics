<script lang="ts">
	import { goto } from "$app/navigation";

	import { page } from "$app/stores";

	import symbols from "$lib/symbols";
	import type { PageData } from "./$types";
	export let data: PageData;

	$: minValue = data.nzdusd.reduce(
		(min, curValue) => (curValue.Open < min ? curValue.Open : min),
		Infinity
	);
	$: maxValue = data.nzdusd.reduce(
		(max, curValue) => (curValue.Open > max ? curValue.Open : max),
		0
	);

	$: yRange = maxValue - minValue;
	$: dateRange = data.now.getTime() - data.oneMonthAgo.getTime();

	function getXforDate(date) {
		return (
			800 * ((date.getTime() - data.oneMonthAgo.getTime()) / dateRange)
		);
	}

	function stringToDate(str) {
		const dateParts = str.split("/");
		return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
	}

	function getCoords(point) {
		const pointDate = stringToDate(point.Date);
		const x = getXforDate(pointDate);

		const y = 160 - 160 * ((point.Open - minValue) / yRange);

		return [x, y];
	}

	$: pathData = data.nzdusd.reduce((path, point, idx) => {
		const nextPoint = data.nzdusd[idx + 1];

		if (!nextPoint) {
			return path;
		}

		const [x, y] = getCoords(point);

		if (idx == 0) {
			return `M ${x} ${y} `;
		}

		return path + `L ${x} ${y}`;
	}, "");
</script>

<div id="main">
	<select value={$page.params.symbol} on:change={(e) => goto("/" + e.target.value)}>
		{#each Object.entries(symbols) as [symbol, type]}
			<option value={symbol}>{symbol} / {type}</option>
		{/each}
	</select>
	<div id="chart-outer">
		<div id="y-axis-key">
			<div style:color="#50a14f">
				{maxValue}
			</div>
			<div style:color="#ca1243">
				{minValue}
			</div>
		</div>
		<div style:position="relative">
			<svg width="800" height="160">
				<path d={pathData} stroke="black" fill="transparent" />
			</svg>

			{#each data.nzNews as newsItem}
				{@const date = new Date(Date.parse(newsItem.date))}
				{@const x = getXforDate(date)}
				{#if x > 0}
					<div
						style="left: {x}px; position: absolute; top: 0; bottom: 0;"
					>
						<div
							style="position: absolute; top: 0; bottom: -4px; width: 2px; background-color: #a626a4;"
						/>
						<div class="news-bubble">
							<div class="news-header">
								<svg
									class="news-icon"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
									/><path d="M18 14h-8" /><path
										d="M15 18h-5"
									/><path d="M10 6h8v4h-8V6Z" /></svg
								>
								<h2 class="news-title">{newsItem.title}</h2>
							</div>
							<p class="news-content">{newsItem.description}</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
		<div />
		<div id="x-axis-key">
			<div>
				{data.oneMonthAgo.toLocaleDateString()}
			</div>
			<div>
				{data.now.toLocaleDateString()}
			</div>
		</div>
	</div>
</div>

<style>
	#main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 12px;
		gap: 24px;
	}
	#chart-outer {
		display: grid;
		grid-template-columns: min-content min-content;
	}

	#y-axis-key {
		border-right: solid 1px gray;
		padding-right: 8px;
		margin-left: 16px;

		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	#x-axis-key {
		border-top: solid 1px gray;
		padding-top: 40px;

		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.news-bubble {
		display: flex;
		flex-direction: column;
		position: absolute;
		bottom: 0;
		transform: translate(-50%, 100%);
		background-color: #a626a4;
		border-radius: 16px;
		width: 26px;
		max-height: 26px;
		transition: width 300ms, max-height 300ms, border-radius 300ms,
			background-color 300ms;
		overflow: clip;
	}
	.news-bubble:hover {
		z-index: 999;
		width: 500px;
		max-height: 400px;
		background-color: #d4b6d4;
	}
	.news-bubble:hover .news-header {
		margin-top: 16px;
		margin-left: 16px;
	}
	.news-header {
		transition: margin-top 300ms, margin-left 300ms;
		margin-top: 4px;
		margin-left: 4px;
	}
	.news-title {
		display: inline;
		margin-left: 8px;
	}
	.news-content {
		margin-left: 16px;
		margin-right: 16px;
		overflow-y: scroll;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
	}
</style>
