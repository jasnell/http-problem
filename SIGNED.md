##### Signed by https://keybase.io/jasnell
```
-----BEGIN PGP SIGNATURE-----
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJVuBr4AAoJEHNBsVwHCHesN0IIAILn8FajSCiWqzMgJmGNj9FX
6ksNs1oI1pe99gHBjBwzdn7f2i+1UiXI+5+Sj13SCLWVY1L6gUcQ8aUyrL33HjWC
lx5EJqwLUy6IcsqX9sd2MCJd0JMv3QHFzX1oWWDTd6MDgPZSHyx+YrPeccabdXzL
LW5tmj4S+fHlTlra71s//PZOKM3D04cxyClx7TJvCygDV4gGaakROMqjIL7M1iVO
lR8nSHVhyp9IIXWnDPNtI6NKvQIEC4nSAA1cUk97Qm0WtC5ASD4Wz4Boc2DR6Kkw
8ih73zOOsXM9wVVW31QKQWBXqb+OCx0qF6yKQKODY2hv0mVb3osk8ZSNud1MnCs=
=X4dM
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size   exec  file            contents                                                        
             ./                                                                              
13             .gitignore    16d30e4462189fb14dd611bdb708c510630c576a1f35b9383e89a4352da36c97
75             .jshintrc     516823ae78f6da2c087c9052a589370f1b25413f3b19507b0a1156b59f2e1d70
7331           index.js      b990f7ab4e83f886896c1c47827d79f7bfbb9be1bde3c1dda1a286ea68de9f65
               lib/                                                                          
11331          LICENSE       5ab7c71b0c0117164d63150d7aee27498450b74b1f62befabcfb47471caf95af
452            package.json  7590b46430c8b1f6d731da5e3322b6798d4f028023c8ad972c57f63d2f23e846
7884           README.md     ab7ebfa44d751f615555837a7f2ef00c3d2d2dbe3b0b5227727d6781aee0928b
               test/                                                                         
3522             test.js     beca92f0c71150ebab3a00c780e005f414bf52b30381cd4686d633f1483232e3
```

#### Ignore

```
/SIGNED.md
```

#### Presets

```
git      # ignore .git and anything as described by .gitignore files
dropbox  # ignore .dropbox-cache and other Dropbox-related files    
kb       # ignore anything as described by .kbignore files          
```

<!-- summarize version = 0.0.9 -->

### End signed statement

<hr>

#### Notes

With keybase you can sign any directory's contents, whether it's a git repo,
source code distribution, or a personal documents folder. It aims to replace the drudgery of:

  1. comparing a zipped file to a detached statement
  2. downloading a public key
  3. confirming it is in fact the author's by reviewing public statements they've made, using it

All in one simple command:

```bash
keybase dir verify
```

There are lots of options, including assertions for automating your checks.

For more info, check out https://keybase.io/docs/command_line/code_signing