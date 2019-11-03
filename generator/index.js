module.exports = function(plop) {
    plop.setGenerator('basics', {
        description: 'Discussions App Component Generator',
        prompts: [
            {
                type: 'list',
                name: 'typeOfReactComponent',
                message: 'Type of React Component',
                choices: ['React Class', 'React FC'],
            },
            {
                type: 'input',
                name: 'path',
                message: 'Path of file (without the file name) i.e. components/new-folder',
            },
            {
                type: 'input',
                name: 'name',
                message: 'Name of File',
            },
        ],
        actions: data => {
            const actions = []

            if (data['typeOfReactComponent'] === 'React Class') {
                actions.push({
                    type: 'add',
                    path: '../{{path}}/{{name}}.tsx',
                    templateFile: 'templates/react-class.hbs',
                })
                actions.push({
                    type: 'add',
                    path: '../{{path}}/style.scss',
                    templateFile: 'templates/style.scss',
                })
            }

            if (data['typeOfReactComponent'] === 'React FC') {
                actions.push({
                    type: 'add',
                    path: '../{{path}}/{{name}}.tsx',
                    templateFile: 'templates/react-fc.hbs',
                })
                actions.push({
                    type: 'add',
                    path: '../{{path}}/style.scss',
                    templateFile: 'templates/style.scss',
                })
            }

            return actions
        },
    })
}
