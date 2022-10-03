{
  description = "PrimaMateria blog";
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, flake-utils, nixpkgs }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in {
        devShells = rec {
          zola = pkgs.mkShell {
            buildInputs = [
              pkgs.zola
            ];
          };
          default = zola;
        };
      }
    );
}
