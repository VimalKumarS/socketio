/**
 * Created by vimal on 1/8/2017.
 */
var express = require('express');
var path = require('path');
var _ = require('lodash');
var app = express();

var server = require("http").Server(app);
var io= require('socket.io')(server);
var port = 8080;

app.use(express.static(path.join(__dirname , "public")));

var Users=[];
var SocketUserMapping=[];
io.on('connection',function(socket){
    //console.log(process);
    console.log('new connection made');
    socket.emit('message-from-server',{
        gretting : 'hello'
    });
    socket.on('message-from-client',function(msg){
        console.log(msg);
    })
    socket.on('disconnect', function () {

        console.log('socket disonnected' + JSON.stringify((socket.id)))
        // remove user from users


        SocketUserMapping= _.filter(SocketUserMapping,function (o) {
            return o.socketid != socket.id
        })
        // remove user for socket id  socketcloseid

        var iffound=_.find(storehmset,function(o){
            return  o.clinetid == socket.id
        });

        if(iffound) {
            var user = iffound.value.username;
            var channel = iffound.value.poNumber;
        }
        storehmset= _.filter(storehmset,function (o) {
            return o.clinetid != socket.id
        })
        var userClients = io.sockets.adapter.rooms[user] //io.sockets.clients(user);

        //Get number of sockets still active in this room
        var channelClients = io.sockets.adapter.rooms[channel];

        var sockets = _.intersection(userClients, channelClients);
        if (sockets.length === 0) {
            //store.srem(channel, user);
            storeSadd = _.filter(storeSadd,function(o){
                return o.poNumber != channel && o.username != user
            })
        }

        //socket.disconnect();
    });


    socket.on('POConnect1',function(data){
       // console.log(data)
        console.log(socket);
        //console.log(socket.id);

        var iffound=_.find(SocketUserMapping,function(o){
            return  o.username == data.username && o.poNumber == data.poNumber
        });

        if(iffound == undefined) {
            SocketUserMapping.push({
                'socketid': socket.id,
                'username': data.username,
                'poNumber': data.poNumber
            });
        }
        var socketcloseid=_.filter(SocketUserMapping,function(o){
            return o.poNumber == data.poNumber
        });




        socketcloseid.forEach(function(o){

            var user1= _.map(_.filter(socketcloseid,function(x){
                return x.username != o.username
            }), 'username');
            if(user1.length !=0) {
                io.sockets.connected[o.socketid].emit('userList', user1,function(res){
                    console.log(res);
                });
            }
        })

        /*var user=_.find(Users,function(o){
          return  o.username == data.username
        });
        if(undefined !=user && user.length !=0){
            user.value.push({
                'socketid':socket.id,
                'username':data.username,
                'poNumber':data.poNumber
            })
        }
        else{
            user={ 'username':data.username ,
                    'value':[]
            };
            user.value.push({
                'socketid':socket.id,
                'username':data.username,
                'poNumber':data.poNumber
            });
            Users.push(user);

        }*/
       // console.log(SocketUserMapping);
    })

    socket.on('POConnect',function(data){
        socket.join(data.poNumber);
        socket.join(data.username);
        var iffound=_.find(storeSadd,function(o){
            return  o.username == data.username && o.poNumber == data.poNumber
        });
        if(iffound == undefined) {
            storeSadd.push({
                'poNumber': data.poNumber,
                'username': data.username
            });
        }
         iffound=_.find(storehmset,function(o){
            return  o.clinetid == socket.id
        });
        if(iffound == undefined) {
            storehmset.push({
                'clinetid': socket.id,
                'value': {
                    'poNumber': data.poNumber,
                    'username': data.username,
                    'socket': socket
                }
            });
        }

        try {
             var user1= _.map(_.filter(storeSadd,function(x){
                return x.poNumber == data.poNumber && x.username != data.username
            }), 'username');
            io.sockets.in(data.poNumber).emit('userList', user1);
        } catch (ex) { console.dir(ex); }

    });

})

var storeSadd=[]
var storehmset=[]

server.listen(port,function () {
    console.log('Listening on port ' + port);
})

//http://notjoshmiller.com/socket-io-rooms-and-redis/