# nodebp
This repo contains the sample code from my Nodebp presentation

## Installation
`
npm install
`

## Usage

Start the first node of the cluster with `node first` or `node second`

After the first node is running on port 8080 start the other members of the cluster with

`
PORT=8081 node first
`

`
PORT=8082 node first
`

or

`
PORT=8081 node second
`

`
PORT=8082 node second
`

NOTE: The express server listens on port `8080+n` (where n is the number of the cluster member) but Ringpop also opens a port on `3000+n`

