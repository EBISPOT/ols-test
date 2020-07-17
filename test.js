
let yargs = require('yargs'),
    fetch = require('node-fetch'),
    chalk = require('chalk'),
    fs = require('fs'),
    deepEqualInAnyOrder = require('deep-equal-in-any-order'),
    chai = require('chai')

chai.use(deepEqualInAnyOrder)

main()

var nOut = 0

async function main() {

    let { instance1, instance2, sampleSize, size } =
            yargs
            .demandOption(['instance1', 'instance2', 'sample-size', 'out-dir', 'size'])
            .argv

    let outDir = yargs.argv.outDir
    let ontologies = yargs.argv._

    for(let ont of ontologies) {

        let ontRoot = '/api/ontologies/' + ont

        await check(ont, ontRoot)
        let terms = await check(ont, ontRoot + '/terms?size=' + size)
        await check(ont, ontRoot + '/terms/roots?size=' + size)
        await check(ont, ontRoot + '/properties?size=' + size)
        await check(ont, ontRoot + '/properties/roots?size=' + size)

        if(terms._embedded && terms._embedded && terms._embedded.terms)  {
            for(let term of sample(terms._embedded.terms.filter(t => t.has_children), sampleSize)) {
                await check(ont, ontRoot + getPath(term._links.parents.href))
                await check(ont, ontRoot + getPath(term._links.ancestors.href))
                await check(ont, ontRoot + getPath(term._links.hierarchicalParents.href))
                await check(ont, ontRoot + getPath(term._links.hierarchicalAncestors.href))
                await check(ont, ontRoot + getPath(term._links.children.href))
                await check(ont, ontRoot + getPath(term._links.descendants.href))
                await check(ont, ontRoot + getPath(term._links.hierarchicalChildren.href))
                await check(ont, ontRoot + getPath(term._links.hierarchicalDescendants.href))
                await check(ont, ontRoot + getPath(term._links.graph.href))
            }
        } else { 
            console.log(chalk.yellow('   ⚠️  Not checking terms as there were no terms in the response'))
        }

        function getPath(href) {
            return href.split(ontRoot)[1]
        }
    }

    async function check(ont, path) {

        console.log(chalk.bold(`[${ont}]`) + ` Checking: ${path}`)

        try {
            var r1 = await fetch(instance1 + path).then(r => r.text())
        } catch(e) {
            console.log(chalk.yellow('   ⚠️  Fetch failed for ' + instance1 + path + ': ' + e))
        }

        try {
            var r2 = await fetch(instance2 + path).then(r => r.text())
        } catch(e) {
            console.log(chalk.yellow('   ⚠️  Fetch failed for ' + instance2 + path + ': ' + e))
        }

        if(!r1 && !r2) {
            return
        }

        let replaced_r2 = r2.split(instance2).join(instance1)

        let failed = false

        try {
            var parsed_r1 = JSON.parse(r1)
            var parsed_r2 = JSON.parse(replaced_r2)
	
	    parsed_r1 = deepSort(parsed_r1)
	    parsed_r2 = deepSort(parsed_r2)

            delete parsed_r1.loaded
            delete parsed_r1.updated
            delete parsed_r2.loaded
            delete parsed_r2.updated

            chai.expect(parsed_r1).to.deep.equalInAnyOrder(parsed_r2)

        } catch(e) {
            failed = true
        }

        if(failed) {
            let n = ++ nOut
            let filename1 = outDir + '/differs' + n + '_instance1.json'
            let filename2 = outDir + '/differs' + n + '_instance2.json'
            console.log(chalk.yellow('   ⚠️  Results differed!  Saved to ' + filename1 + ' and ' + filename2))
            fs.writeFileSync(filename1, JSON.stringify(parsed_r1, null, 2))
            fs.writeFileSync(filename2, JSON.stringify(parsed_r2, null, 2))
        } else {
            console.log(chalk.green('   ✅ Results were equal'))
        }

        return parsed_r1 || parsed_r2
    }
}

function sample(arr, n) {
    let s = []
    while(n -- > 0) {
        s.push(arr[Math.floor(Math.random() * arr.length)])
    }
    return s
}

function deepSort(o) {
	if(Array.isArray(o)) {
		return o.map(deepSort).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
	} else if(o instanceof Object) {
		//	return Object.keys(o).sort().map(k => ({ k: k, v: o[k] }))
		var newObj = {}
		for(let k of Object.keys(o).sort()) {
			newObj[k] = deepSort(o[k])
		}

		return newObj
	} else {
	    return o
	}	
}



