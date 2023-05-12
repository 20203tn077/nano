type VariableType = 'model' | 'prop' | 'aux'
type VariableSymbol = '$' | '*' | '#'
type ObjectModel = {
  name: string
  props: string[]
}

type Template = {
  templateString: string
  element: HTMLElement
  models: string[]
  object?: ObjectModel | ObjectModel[]
}

type Model = {
  value: object | object[] | null
  templates: string[]
}

class NanoApplication {
  private readonly _SYMBOLS: Record<VariableType, VariableSymbol> = {
    model: '$',
    prop: '*',
    aux: '#',
  }
  private readonly _REG_EXPS: Record<VariableType, RegExp> = {
    model: this._getVariableRegExp('model'),
    prop: this._getVariableRegExp('prop'),
    aux: this._getVariableRegExp('aux'),
  }
  private _templates: Map<string, Template>
  private _models: Map<string, Model>

  public context: Record<string, Model>

  constructor() {
    const classThis = this
    classThis.context = new Proxy(
      {},
      {
        get(target, prop: string) {
          return classThis._models.get(prop)?.value
        },
        set(target, prop: string, newValue) {
          const model: Model = classThis._models.get(prop) ?? {
            templates: [],
            value: null,
          }
          model.value = newValue
          classThis._models.set(prop, model)
          classThis._refresh(model)
          return true
        },
      }
    )
  }

  public refresh(modelName: string): void {}
  public render(templateName: string): void {}

  private _refresh(model: Model): void {
    for (const templateName of model.templates) {
      const template = this._templates.get(templateName)
      if (template) this._render(template)
    }
  }
  private _render(template: Template): void {
    let templateResult = ''
    const { element, models, object } = template
    let { templateString } = template
    for (const modelName of models) {
      const model = this._models.get(modelName) ?? {templates: [], value: null}
      templateString = this._replaceVariable(
        templateString,
        'model',
        modelName,
        model.value
      )
    }
    if (object) {
      if (Array.isArray(object)) templateResult = object.reduce((listResult, item, index, array) => {
        let itemResult = templateString
        const first = index === 0
        const last = index = array.length - 1
        const even = index % 2 === 1
  
        itemResult = this._replaceVariable(itemResult, 'aux', 'index', index)
        itemResult = this._replaceVariable(itemResult, 'aux', 'count', index + 1)
        itemResult = this._replaceVariable(itemResult, 'aux', 'first', first)
        itemResult = this._replaceVariable(itemResult, 'aux', 'last', last)
        itemResult = this._replaceVariable(itemResult, 'aux', 'even', index)
        itemResult = this._replaceVariable(itemResult, 'aux', 'odd', index)
        itemResult = this._replaceVariable(itemResult, 'aux', 'firstOrLast', first ? 'first' : last ? 'last' : null)
        itemResult = this._replaceVariable(itemResult, 'aux', 'evenOrOdd', even ? 'even' : 'odd')
  
        // itemResult = this._replaceProps(itemResult)
      })
    }
  }
  private _replaceProps(
    template: string,
    object: ObjectModel
  ): string {
    return ''
  }
  private _replaceVariable(
    template: string,
    type: VariableType,
    name: string,
    value: any
  ): string {
    return ''
  }
  private _getVariable(type: VariableType, name: string): string {
    return `${this._SYMBOLS[type]}{${name}}`
  }
  private _getTemplateVariables(template: string, type: VariableType): string {
    return ''
  }
  private _getVariableRegExp(type: VariableType): RegExp {
    return new RegExp(`\\${this._SYMBOLS['prop']}\\{\\w\\}`, 'gi')
  }
}
