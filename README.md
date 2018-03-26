# xy-inc - Backend as a Service

## Descrição

A aplicaço tem como objetivo permitir o cadastro de modelos de domínio. Para cada modelo cadastrado, a aplicação irá expor os serviços básicos de CRUD via padrão RESTful de forma automática.

## Arquitetura

Uma das principais características do problema a ser resolvido é o ambiente extremamente dinâmico, sendo que o desenvolvedor não irá mais depender de modelos de domínio estáticos e definidos por desenvolvedores terceiros. Os modelos serão definidos dinamicamente e regras básicas como tipos de dados e quantidade de atributos deverão ser atentidas de forma transparente.

Levando em consideração esta característica, as seguintes tecnologias foram adotadas:

* JavaScript - Por ser uma linguagem dinâmica e possuir flexibilidade para trabalhar com objetos (modelos);
* Node.js - Plataforma de desenvolvimento que apresenta algumas vantagens como: operações de I/O não bloqueantes, simplicidade na publicação por atuar como servidor Web;
* Express - Framework web para Node.js;
* Couchbase - Banco de dados NoSQL distribuído possuindo alta disponiblidade e alta performance. Por ser um banco de dados orientado a documentos ele representa uma peça chave na arquitetura, pois não depende de um esquema rígido como os bancos de dados tradicionais;
* JSON Schema - Uma forma de validar documentos JSON. Mesmo se tratando de um projeto dinâmico, algumas validações devem ser feitas como os tipos de dados permitidos na definição dos modelos, a estrutura do modelo e por fim se a estrutura com os dados enviados corresponde com a estrutura do modelo cadastrado;


A versão inicial irá possuir duas rotas, uma para o cadastro de modelos e a outra para realizar as operações de CRUD utilizando os modelos, servidas através do Node.js. Os dados serão amazendos em um cluster Couchbase inicialmente formado por um nó.

## Teste

Pré-requisitos:
* Instalar o Docker e o docker-compose;
* Realizar algumas configurações no couchbase.

Para iniciar o ambiente execute os seguintes passos:

* Execute o script `start.sh`. Este script executará o docker-compose e irá iniciar as imagens do Node.js e do Couchbase;
* Execute o comando `npm install` para instalar as dependências do projeto;
* Execute o script `couchbase/config/provision.sh` para inicializar o Couchbase;
* Acesse o console Web do Couchbase através do endereço http://localhost:8091/ui/index.html#/auth - Username: Administrator Password: password;
* Execute os dois comandos listados no arquivo `couchbase/config/create-primary-index` através da aba Query (http://localhost:8091/ui/index.html#/query/workbench);
* Verifique se os índices foram criados através da aba Indexes (http://localhost:8091/ui/index.html#/index);
* Execute o comando `npm test` para executar os testes da aplicação.

## Inicialização

Para inicializar a aplicação basta executar o comando `npm start`. A aplicação será exposta através da seguinte URL http://localhost:8080.

Para facilitar a compreensão e os testes uma collection do Postman está disponibilizada através da seguinte URL: https://www.getpostman.com/collections/fe7776dc7df90d07d309.

## Models - Regras de Cadastro

A aplicação possui um JSON Schema para determinar o formato do modelo que poderá ser cadastrado no sistema. Existe uma rota para consultar este schema (http://localhost:8080/models/schema).

Basicamente as regras são as seguintes:
* O sistema não permite o cadastro de modelos aninhados;
* Os tipos de dados permitidos são os seguintes: boolean, integer, number e string;
* O modelo deve possuir um atributo id de tipo string ou integer.

Exemplo de modelo:

```json
{
    "id": {
    	"type": "integer"	
    },
    "model": {
        "type": "string" 
    },
    "color": {
        "type": "string"
    }
}
```

**Observação:** O nome do modelo é passado na URL. Exemplo: http://localhost:8080/models/car

## Melhorias Identificadas

* Adicionar uma camada de cache para não acessar o banco de dados a cada requisição para recuperar o JSON Schema do modelo para realizar validações;
* Versionar os modelos para que o desenvolvedor possa trabalhar com versões mais antigas e não quebrar o sistema client inesperadamente.
* Reaproveitar a conexão com os buckets do Couchbase.




