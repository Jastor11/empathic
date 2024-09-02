import { assert, assertEquals, assertInstanceOf } from 'jsr:@std/assert@1.0';
import { describe, it } from 'jsr:@std/testing@1.0/bdd';
import { join, resolve } from 'node:path';

import * as walk from './walk.ts';

describe('walk.up', () => {
	const fixtures = resolve('fixtures');

	it('should be a function', () => {
		assertEquals(typeof walk.up, 'function');
	});

	let parents = walk.up(
		join(fixtures, 'a/b/c'),
	);

	it('should return an Array of parent directories', () => {
		assertInstanceOf(parents, Array);
	});

	it('should resolve input from CWD if not absolute', () => {
		let output = walk.up('fixtures/a/b/c');
		assertEquals(output, parents);
	});

	it('should start with the initial directory', () => {
		assertEquals(parents[0], resolve('fixtures/a/b/c'));
	});

	it('should return all parents until "/" root', () => {
		assertEquals(parents[0], resolve('fixtures/a/b/c'));
		assertEquals(parents[1], resolve('fixtures/a/b'));
		assertEquals(parents[2], resolve('fixtures/a'));
		assertEquals(parents[3], resolve('fixtures'));
		assertEquals(parents[4], resolve('.'));
		// total chain length unknown
		assertEquals(parents.at(-1), resolve('/'));
	});

	it.skip('should resolve from `options.cwd` if input not absolute', () => {
		let output = walk.up('a/b/c', {
			cwd: fixtures,
		});

		assertEquals(output, parents);
	});

	it('should stop at `options.stop` directory', () => {
		let output = walk.up('fixtures/a/b/c', {
			stop: fixtures,
		});

		assert(parents.length > output.length);
	});

	it('should NOT include `options.stop` directory', () => {
		let output = walk.up('fixtures/a/b/c', {
			stop: fixtures,
		});

		assertEquals(output.at(-1), join(fixtures, 'a'));
	});

	it('should return nothing if stop === start', () => {
		let start = resolve('fixtures/a/b/c');
		let output = walk.up(start, { stop: start });
		assertEquals(output.length, 0);
	});

	// find-up/locate-paths cycle in infinite loop
	it('should still exit at root if stop is child of start', () => {
		let start = resolve('fixtures/a/b/c');
		let stop = join(start, 'd/e/f');

		let output = walk.up(start, { stop });

		assertEquals(output[0], resolve('fixtures/a/b/c'));
		assertEquals(output[1], resolve('fixtures/a/b'));
		assertEquals(output[2], resolve('fixtures/a'));
		assertEquals(output.at(-1), resolve('/'));

		assertEquals(output, parents);
	});
});
